"use client";

import { useState, useEffect, useMemo } from "react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { Expense, CreateExpenseData, DocumentType, Currency } from "@/lib/types/expense";
import { validatePositiveNumber, validateRequired } from "@/lib/validations";
import { useWorks } from "@/hooks/api/works";
import { useSuppliers } from "@/hooks/api/suppliers";
import { useRubrics } from "@/hooks/api/rubrics";
import { calculateTaxes, getCalculationRulesExplanation } from "@/lib/calculations";
import { FiscalCondition } from "@/lib/types/supplier";
import { Info } from "lucide-react";

interface ExpenseFormProps {
  initialData?: Expense | null;
  onSubmit: (data: CreateExpenseData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export function ExpenseForm({ initialData, onSubmit, onCancel, isLoading }: ExpenseFormProps) {
  const { works } = useWorks();
  const { suppliers } = useSuppliers();
  const { rubrics } = useRubrics();

  const [formData, setFormData] = useState({
    work_id: "",
    supplier_id: "",
    contract_id: "",
    rubric_id: "",
    amount: 0,
    currency: "ARS" as Currency,
    purchase_date: new Date().toISOString().split("T")[0],
    document_type: "INVOICE_A" as DocumentType,
    document_number: "",
    file_url: "",
    observations: "",
    vat_amount: 0,
    vat_rate: 21,
    vat_perception: 0,
    vat_withholding: 0,
    iibb_perception: 0,
    income_tax_withholding: 0,
    ...initialData,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isAutoCalculated, setIsAutoCalculated] = useState({
    vat_perception: false,
    vat_withholding: false,
    iibb_perception: false,
    income_tax_withholding: false,
  });

  // Get selected supplier to access fiscal condition
  const selectedSupplier = useMemo(() => {
    if (!formData.supplier_id) return null;
    return suppliers?.find((s) => s.id === formData.supplier_id) || null;
  }, [formData.supplier_id, suppliers]);

  // Calculate taxes automatically when amount, supplier, or document_type changes
  useEffect(() => {
    // Only auto-calculate if all required fields are present and taxes haven't been manually edited
    if (
      formData.amount > 0 &&
      selectedSupplier?.fiscal_condition &&
      formData.document_type &&
      (isAutoCalculated.vat_perception || 
       isAutoCalculated.vat_withholding || 
       isAutoCalculated.iibb_perception || 
       isAutoCalculated.income_tax_withholding)
    ) {
      const calculations = calculateTaxes(
        formData.amount,
        selectedSupplier.fiscal_condition as FiscalCondition,
        formData.document_type,
      );

      // Only update if values haven't been manually edited
      if (isAutoCalculated.vat_perception) {
        setFormData((prev) => ({ ...prev, vat_perception: calculations.vat_perception }));
      }
      if (isAutoCalculated.vat_withholding) {
        setFormData((prev) => ({ ...prev, vat_withholding: calculations.vat_withholding }));
      }
      if (isAutoCalculated.iibb_perception) {
        setFormData((prev) => ({ ...prev, iibb_perception: calculations.iibb_perception }));
      }
      if (isAutoCalculated.income_tax_withholding) {
        setFormData((prev) => ({ ...prev, income_tax_withholding: calculations.income_tax_withholding }));
      }
    }
  }, [formData.amount, formData.supplier_id, formData.document_type, selectedSupplier?.fiscal_condition]);

  // Initialize auto-calculated flags
  useEffect(() => {
    if (!initialData) {
      // For new expenses, all taxes are auto-calculated
      setIsAutoCalculated({
        vat_perception: true,
        vat_withholding: true,
        iibb_perception: true,
        income_tax_withholding: true,
      });
    } else {
      // For existing expenses, check if taxes were manually set
      // If taxes are 0 or null, they can be auto-calculated
      setIsAutoCalculated({
        vat_perception: !initialData.vat_perception || initialData.vat_perception === 0,
        vat_withholding: !initialData.vat_withholding || initialData.vat_withholding === 0,
        iibb_perception: !initialData.iibb_perception || initialData.iibb_perception === 0,
        income_tax_withholding: !initialData.income_tax_withholding || initialData.income_tax_withholding === 0,
      });
    }
  }, [initialData]);

  useEffect(() => {
    if (initialData) {
      const purchaseDate = initialData.purchase_date
        ? (typeof initialData.purchase_date === "string"
            ? initialData.purchase_date.split("T")[0]
            : new Date(initialData.purchase_date).toISOString().split("T")[0])
        : new Date().toISOString().split("T")[0];

      setFormData({
        work_id: initialData.work_id || "",
        supplier_id: initialData.supplier_id || "",
        contract_id: initialData.contract_id || "",
        rubric_id: initialData.rubric_id || "",
        amount: initialData.amount || 0,
        currency: initialData.currency || "ARS",
        purchase_date: purchaseDate,
        document_type: initialData.document_type || "INVOICE_A",
        document_number: initialData.document_number || "",
        file_url: initialData.file_url || "",
        observations: initialData.observations || "",
        vat_amount: initialData.vat_amount || 0,
        vat_rate: initialData.vat_rate || 21,
        vat_perception: initialData.vat_perception || 0,
        vat_withholding: initialData.vat_withholding || 0,
        iibb_perception: initialData.iibb_perception || 0,
        income_tax_withholding: initialData.income_tax_withholding || 0,
      });
    }
  }, [initialData]);

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.work_id) {
      newErrors.work_id = "La obra es requerida";
    }
    if (!formData.rubric_id) {
      newErrors.rubric_id = "El rubro es requerido";
    }
    if (formData.document_type !== "VAL" && !formData.supplier_id) {
      newErrors.supplier_id = "El proveedor es requerido (excepto para VAL)";
    }
    const amountValidation = validatePositiveNumber(formData.amount);
    if (!amountValidation.isValid) {
      newErrors.amount = amountValidation.error || "El monto debe ser mayor que 0";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const submitData: CreateExpenseData = {
      work_id: formData.work_id,
      supplier_id: formData.supplier_id || undefined,
      contract_id: formData.contract_id || undefined,
      rubric_id: formData.rubric_id,
      amount: formData.amount,
      currency: formData.currency,
      purchase_date: formData.purchase_date,
      document_type: formData.document_type,
      document_number: formData.document_number || undefined,
      file_url: formData.file_url || undefined,
      observations: formData.observations || undefined,
      vat_amount: formData.vat_amount > 0 ? formData.vat_amount : undefined,
      vat_rate: formData.vat_rate > 0 ? formData.vat_rate : undefined,
      vat_perception: formData.vat_perception > 0 ? formData.vat_perception : undefined,
      vat_withholding: formData.vat_withholding > 0 ? formData.vat_withholding : undefined,
      iibb_perception: formData.iibb_perception > 0 ? formData.iibb_perception : undefined,
      income_tax_withholding: formData.income_tax_withholding > 0 ? formData.income_tax_withholding : undefined,
    };

    await onSubmit(submitData);
  };

  const calculationExplanation = useMemo(() => {
    if (!selectedSupplier?.fiscal_condition || !formData.document_type) return null;
    return getCalculationRulesExplanation(
      selectedSupplier.fiscal_condition as FiscalCondition,
      formData.document_type,
    );
  }, [selectedSupplier?.fiscal_condition, formData.document_type]);

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Basic Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Select
          label="Obra"
          value={formData.work_id}
          onChange={(e) => {
            setFormData({ ...formData, work_id: e.target.value });
            if (errors.work_id) setErrors({ ...errors, work_id: "" });
          }}
          error={errors.work_id}
          required
        >
          <option value="">Seleccionar obra</option>
          {works?.map((work) => (
            <option key={work.id} value={work.id}>
              {work.name}
            </option>
          ))}
        </Select>

        <Select
          label="Rubro"
          value={formData.rubric_id}
          onChange={(e) => {
            setFormData({ ...formData, rubric_id: e.target.value });
            if (errors.rubric_id) setErrors({ ...errors, rubric_id: "" });
          }}
          error={errors.rubric_id}
          required
        >
          <option value="">Seleccionar rubro</option>
          {rubrics?.map((rubric: any) => (
            <option key={rubric.id} value={rubric.id}>
              {rubric.name || rubric.nombre}
            </option>
          ))}
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Select
          label="Proveedor"
          value={formData.supplier_id}
          onChange={(e) => {
            setFormData({ ...formData, supplier_id: e.target.value });
            if (errors.supplier_id) setErrors({ ...errors, supplier_id: "" });
            // Reset auto-calculated flags when supplier changes
            setIsAutoCalculated({
              vat_perception: true,
              vat_withholding: true,
              iibb_perception: true,
              income_tax_withholding: true,
            });
          }}
          error={errors.supplier_id}
          required={formData.document_type !== "VAL"}
          disabled={formData.document_type === "VAL"}
        >
          <option value="">Seleccionar proveedor</option>
          {suppliers?.map((supplier) => (
            <option key={supplier.id} value={supplier.id}>
              {supplier.name || supplier.nombre}
            </option>
          ))}
        </Select>

        <Select
          label="Tipo de Documento"
          value={formData.document_type}
          onChange={(e) => {
            setFormData({ ...formData, document_type: e.target.value as DocumentType });
            // Reset auto-calculated flags when document type changes
            setIsAutoCalculated({
              vat_perception: true,
              vat_withholding: true,
              iibb_perception: true,
              income_tax_withholding: true,
            });
          }}
          required
        >
          <option value="INVOICE_A">Factura A</option>
          <option value="INVOICE_B">Factura B</option>
          <option value="INVOICE_C">Factura C</option>
          <option value="VAL">VAL</option>
          <option value="RECEIPT">Recibo</option>
          <option value="CREDIT_NOTE">Nota de Crédito</option>
          <option value="DEBIT_NOTE">Nota de Débito</option>
          <option value="OTHER">Otro</option>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Monto"
          type="number"
          step="0.01"
          value={formData.amount}
          onChange={(e) => {
            const newAmount = parseFloat(e.target.value) || 0;
            setFormData({ ...formData, amount: newAmount });
            if (errors.amount) setErrors({ ...errors, amount: "" });
            // Reset auto-calculated flags when amount changes
            setIsAutoCalculated({
              vat_perception: true,
              vat_withholding: true,
              iibb_perception: true,
              income_tax_withholding: true,
            });
          }}
          onBlur={() => {
            setTouched({ ...touched, amount: true });
            const amountValidation = validatePositiveNumber(formData.amount);
            if (!amountValidation.isValid) {
              setErrors({ ...errors, amount: amountValidation.error || "El monto debe ser mayor que 0" });
            } else {
              setErrors({ ...errors, amount: "" });
            }
          }}
          error={errors.amount}
          required
        />

        <Select
          label="Moneda"
          value={formData.currency}
          onChange={(e) => setFormData({ ...formData, currency: e.target.value as Currency })}
          required
        >
          <option value="ARS">ARS (Pesos Argentinos)</option>
          <option value="USD">USD (Dólares)</option>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Fecha de Compra"
          type="date"
          value={formData.purchase_date}
          onChange={(e) => setFormData({ ...formData, purchase_date: e.target.value })}
          required
        />

        <Input
          label="Número de Documento"
          value={formData.document_number}
          onChange={(e) => setFormData({ ...formData, document_number: e.target.value })}
          placeholder="Ej: 0001-00001234"
          disabled={formData.document_type === "VAL"}
        />
      </div>

      {/* VAT Information */}
      <div className="border-t pt-4">
        <h3 className="text-lg font-semibold mb-3">Información de IVA</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            label="Monto IVA"
            type="number"
            step="0.01"
            value={formData.vat_amount}
            onChange={(e) => setFormData({ ...formData, vat_amount: parseFloat(e.target.value) || 0 })}
          />
          <Input
            label="Tasa IVA (%)"
            type="number"
            step="0.01"
            value={formData.vat_rate}
            onChange={(e) => setFormData({ ...formData, vat_rate: parseFloat(e.target.value) || 0 })}
          />
        </div>
      </div>

      {/* Perceptions and Withholdings */}
      <div className="border-t pt-4">
        <h3 className="text-lg font-semibold mb-3">Percepciones y Retenciones</h3>
        
        {calculationExplanation && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
            <div className="flex items-start gap-2">
              <Info className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-blue-800">{calculationExplanation}</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Input
              label="Percepción IVA"
              type="number"
              step="0.01"
              value={formData.vat_perception}
              onChange={(e) => {
                setFormData({ ...formData, vat_perception: parseFloat(e.target.value) || 0 });
                setIsAutoCalculated((prev) => ({ ...prev, vat_perception: false }));
              }}
            />
            {isAutoCalculated.vat_perception && formData.vat_perception > 0 && (
              <p className="text-xs text-gray-500 mt-1">Calculado automáticamente</p>
            )}
          </div>

          <div>
            <Input
              label="Retención IVA"
              type="number"
              step="0.01"
              value={formData.vat_withholding}
              onChange={(e) => {
                setFormData({ ...formData, vat_withholding: parseFloat(e.target.value) || 0 });
                setIsAutoCalculated((prev) => ({ ...prev, vat_withholding: false }));
              }}
            />
            {isAutoCalculated.vat_withholding && formData.vat_withholding > 0 && (
              <p className="text-xs text-gray-500 mt-1">Calculado automáticamente</p>
            )}
          </div>

          <div>
            <Input
              label="Percepción IIBB"
              type="number"
              step="0.01"
              value={formData.iibb_perception}
              onChange={(e) => {
                setFormData({ ...formData, iibb_perception: parseFloat(e.target.value) || 0 });
                setIsAutoCalculated((prev) => ({ ...prev, iibb_perception: false }));
              }}
            />
            {isAutoCalculated.iibb_perception && formData.iibb_perception > 0 && (
              <p className="text-xs text-gray-500 mt-1">Calculado automáticamente</p>
            )}
          </div>

          <div>
            <Input
              label="Retención Ganancias"
              type="number"
              step="0.01"
              value={formData.income_tax_withholding}
              onChange={(e) => {
                setFormData({ ...formData, income_tax_withholding: parseFloat(e.target.value) || 0 });
                setIsAutoCalculated((prev) => ({ ...prev, income_tax_withholding: false }));
              }}
            />
            {isAutoCalculated.income_tax_withholding && formData.income_tax_withholding > 0 && (
              <p className="text-xs text-gray-500 mt-1">Calculado automáticamente</p>
            )}
          </div>
        </div>
      </div>

      {/* Additional Information */}
      <div className="border-t pt-4">
        <Input
          label="URL del Archivo"
          type="url"
          value={formData.file_url}
          onChange={(e) => setFormData({ ...formData, file_url: e.target.value })}
          placeholder="https://..."
        />
        <Textarea
          label="Observaciones"
          value={formData.observations}
          onChange={(e) => setFormData({ ...formData, observations: e.target.value })}
          rows={3}
        />
      </div>

      <div className="flex gap-3 justify-end pt-4">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
          Cancelar
        </Button>
        <Button type="submit" variant="primary" loading={isLoading} disabled={isLoading}>
          {initialData ? "Actualizar" : "Crear"}
        </Button>
      </div>
    </form>
  );
}
