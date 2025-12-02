"use client";

import { useParams, useRouter } from "next/navigation";
import { MainLayout } from "@/components/layout/MainLayout";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useDocument } from "@/hooks/api/documents";
import { LoadingState } from "@/components/ui/LoadingState";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { BotonVolver } from "@/components/ui/BotonVolver";

function DocumentDetailContent() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const { document, isLoading, error } = useDocument(id);

  const getFileIcon = (type: string | undefined): string => {
    if (!type) return "📄";
    const typeLower = type.toLowerCase();
    
    if (typeLower.includes("pdf")) return "📕";
    if (typeLower.includes("image") || typeLower.includes("jpg") || typeLower.includes("png") || typeLower.includes("gif")) return "🖼️";
    if (typeLower.includes("excel") || typeLower.includes("xls") || typeLower.includes("xlsx")) return "📊";
    if (typeLower.includes("word") || typeLower.includes("doc")) return "📝";
    if (typeLower.includes("zip") || typeLower.includes("rar")) return "📦";
    
    return "📄";
  };

  const getFileTypeLabel = (type: string | undefined): string => {
    if (!type) return "Archivo";
    const typeLower = type.toLowerCase();
    
    if (typeLower.includes("pdf")) return "PDF";
    if (typeLower.includes("image") || typeLower.includes("jpg") || typeLower.includes("png") || typeLower.includes("gif")) return "Imagen";
    if (typeLower.includes("excel") || typeLower.includes("xls") || typeLower.includes("xlsx")) return "Excel";
    if (typeLower.includes("word") || typeLower.includes("doc")) return "Word";
    if (typeLower.includes("zip") || typeLower.includes("rar")) return "Comprimido";
    
    return type.toUpperCase();
  };

  const formatDate = (dateString: string | undefined): string => {
    if (!dateString) return "No especificada";
    try {
      return new Date(dateString).toLocaleString("es-ES", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateString;
    }
  };

  const handleDownload = () => {
    const fileUrl = document?.url || document?.fileUrl;
    if (fileUrl) {
      window.open(fileUrl, "_blank");
    } else {
      const downloadUrl = `${process.env.NEXT_PUBLIC_API_URL}/documents/${id}/download`;
      window.open(downloadUrl, "_blank");
    }
  };

  const handleView = () => {
    const fileUrl = document?.url || document?.fileUrl;
    const fileType = document?.tipo || document?.type || document?.mimeType || "";
    const isPdf = fileType.toLowerCase().includes("pdf");
    
    if (fileUrl) {
      window.open(fileUrl, "_blank");
    } else {
      // Si no hay URL, intentar ver desde la API
      const viewUrl = `${process.env.NEXT_PUBLIC_API_URL}/documents/${id}`;
      window.open(viewUrl, "_blank");
    }
  };

  if (isLoading) {
    return (
      <MainLayout>
        <LoadingState message="Cargando archivo…" />
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-pmd">
          Error al cargar el archivo: {error.message || "Error desconocido"}
        </div>
        <div className="mt-4">
          <Button onClick={() => router.push("/documents")}>Volver a Documentación</Button>
        </div>
      </MainLayout>
    );
  }

  if (!document) {
    return (
      <MainLayout>
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-pmd">
          Archivo no encontrado
        </div>
        <div className="mt-4">
          <Button onClick={() => router.push("/documents")}>Volver a Documentación</Button>
        </div>
      </MainLayout>
    );
  }

  const fileName = document.nombre || document.name || document.fileName || "Sin nombre";
  const fileType = document.tipo || document.type || document.mimeType || "";
  const uploadDate = document.fecha || document.uploadDate || document.createdAt;
  const uploadedBy = document.usuario || document.uploadedBy || document.userId || "Usuario desconocido";
  const description = document.descripcion || document.description || "";

  const renderField = (label: string, value: any, formatter?: (val: any) => string) => {
    if (value === null || value === undefined || value === "") return null;
    return (
      <div>
        <h3 className="text-sm font-semibold text-gray-700 mb-2">{label}</h3>
        <p className="text-gray-900">{formatter ? formatter(value) : String(value)}</p>
      </div>
    );
  };

  return (
    <MainLayout>
      <div className="space-y-6 py-6">
        <div className="px-1">
          <BotonVolver />
        </div>
        <div className="flex items-center justify-between px-1">
          <div>
            <h1 className="text-3xl font-bold text-pmd-darkBlue mb-2">Detalle del archivo</h1>
            <p className="text-gray-600">Información completa del archivo seleccionado</p>
          </div>
          <Button variant="outline" onClick={() => router.push("/documents")}>
            Volver a Documentación
          </Button>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="text-5xl">{getFileIcon(fileType)}</span>
                <div>
                  <CardTitle className="text-2xl mb-2">{fileName}</CardTitle>
                  <Badge variant="info">{getFileTypeLabel(fileType)}</Badge>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {renderField("Nombre del archivo", fileName)}
              {renderField("Tipo", getFileTypeLabel(fileType))}
              {renderField("Fecha de subida", uploadDate, formatDate)}
              {renderField("Subido por", uploadedBy)}
            </div>

            {description && (
              <div className="pt-4 border-t border-gray-200">
                <h3 className="text-sm font-semibold text-gray-700 mb-2">Descripción</h3>
                <p className="text-gray-900">{description}</p>
              </div>
            )}

            <div className="flex gap-4 pt-4 border-t border-gray-200">
              <Button
                variant="primary"
                size="lg"
                onClick={handleView}
              >
                Ver archivo
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={handleDownload}
              >
                Descargar archivo
              </Button>
            </div>

            {document.id && (
              <div className="pt-4 border-t border-gray-200">
                <h3 className="text-sm font-semibold text-gray-700 mb-2">ID del archivo</h3>
                <p className="text-gray-600 font-mono text-sm">{document.id}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}

export default function DocumentDetailPage() {
  return (
    <ProtectedRoute>
      <DocumentDetailContent />
    </ProtectedRoute>
  );
}

