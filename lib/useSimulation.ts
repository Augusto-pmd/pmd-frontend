/**
 * Sistema de simulación PMD
 * 
 * Activar/desactivar datos dummy para desarrollo y pruebas
 * sin depender del backend.
 */

export const SIMULATION_MODE = true;

// ============================================
// DATOS DUMMY - OBRAS
// ============================================
export const SIMULATED_WORKS = [
  {
    id: "ob-001",
    name: "Casa Náutica – Nordelta",
    title: "Casa Náutica – Nordelta",
    nombre: "Casa Náutica – Nordelta",
    address: "Barrio Los Lagos, Nordelta",
    status: "active",
    startDate: "2024-01-10",
    squareMeters: 320,
    managerId: "stf-002",
    createdAt: "2024-01-10T00:00:00Z",
    updatedAt: "2024-02-15T00:00:00Z",
  },
  {
    id: "ob-002",
    name: "Vivienda Minimalista – El Naudir",
    title: "Vivienda Minimalista – El Naudir",
    nombre: "Vivienda Minimalista – El Naudir",
    status: "planned",
    squareMeters: 240,
    createdAt: "2024-02-01T00:00:00Z",
    updatedAt: "2024-02-01T00:00:00Z",
  },
  {
    id: "ob-003",
    name: "Edificio Residencial – Palermo",
    title: "Edificio Residencial – Palermo",
    nombre: "Edificio Residencial – Palermo",
    address: "Av. Santa Fe 3200, Palermo",
    status: "active",
    startDate: "2023-11-15",
    squareMeters: 1200,
    managerId: "stf-001",
    createdAt: "2023-11-15T00:00:00Z",
    updatedAt: "2024-02-10T00:00:00Z",
  },
];

// ============================================
// DATOS DUMMY - EMPLEADOS / STAFF
// ============================================
export const SIMULATED_STAFF = [
  {
    id: "stf-001",
    fullName: "Martín López",
    name: "Martín López",
    nombre: "Martín López",
    role: "Arquitecto",
    subrole: "Proyecto",
    hireDate: "2022-03-14",
    workId: "ob-001",
    isActive: true,
    email: "martin.lopez@pmd.com",
    phone: "+54 11 4567-8901",
    createdAt: "2022-03-14T00:00:00Z",
  },
  {
    id: "stf-002",
    fullName: "Gustavo Reynoso",
    name: "Gustavo Reynoso",
    nombre: "Gustavo Reynoso",
    role: "Jefe de Obra",
    subrole: "Ejecución",
    hireDate: "2021-10-02",
    workId: "ob-001",
    isActive: true,
    email: "gustavo.reynoso@pmd.com",
    phone: "+54 11 4567-8902",
    createdAt: "2021-10-02T00:00:00Z",
  },
  {
    id: "stf-003",
    fullName: "Ana Duarte",
    name: "Ana Duarte",
    nombre: "Ana Duarte",
    role: "Administración",
    subrole: "Contabilidad",
    hireDate: "2020-08-15",
    isActive: false,
    email: "ana.duarte@pmd.com",
    phone: "+54 11 4567-8903",
    createdAt: "2020-08-15T00:00:00Z",
  },
  {
    id: "stf-004",
    fullName: "Carlos Mendoza",
    name: "Carlos Mendoza",
    nombre: "Carlos Mendoza",
    role: "Dirección",
    subrole: "Director General",
    hireDate: "2019-01-10",
    isActive: true,
    email: "carlos.mendoza@pmd.com",
    phone: "+54 11 4567-8904",
    createdAt: "2019-01-10T00:00:00Z",
  },
  {
    id: "stf-005",
    fullName: "Laura Fernández",
    name: "Laura Fernández",
    nombre: "Laura Fernández",
    role: "RRHH",
    subrole: "Recursos Humanos",
    hireDate: "2021-05-20",
    isActive: true,
    email: "laura.fernandez@pmd.com",
    phone: "+54 11 4567-8905",
    createdAt: "2021-05-20T00:00:00Z",
  },
  {
    id: "stf-006",
    fullName: "Roberto Silva",
    name: "Roberto Silva",
    nombre: "Roberto Silva",
    role: "Jefe de Obra",
    subrole: "Ejecución",
    hireDate: "2022-11-08",
    workId: "ob-002",
    isActive: true,
    email: "roberto.silva@pmd.com",
    phone: "+54 11 4567-8906",
    createdAt: "2022-11-08T00:00:00Z",
  },
  {
    id: "stf-007",
    fullName: "María González",
    name: "María González",
    nombre: "María González",
    role: "Compras",
    subrole: "Compras y Logística",
    hireDate: "2023-02-14",
    isActive: true,
    email: "maria.gonzalez@pmd.com",
    phone: "+54 11 4567-8907",
    createdAt: "2023-02-14T00:00:00Z",
  },
  {
    id: "stf-008",
    fullName: "Juan Pérez",
    name: "Juan Pérez",
    nombre: "Juan Pérez",
    role: "Obrero",
    subrole: "Construcción",
    hireDate: "2023-06-01",
    workId: "ob-001",
    isActive: true,
    email: "juan.perez@pmd.com",
    phone: "+54 11 4567-8908",
    createdAt: "2023-06-01T00:00:00Z",
  },
];

// ============================================
// DATOS DUMMY - PROVEEDORES
// ============================================
export const SIMULATED_SUPPLIERS = [
  {
    id: "sup-001",
    name: "Acindar",
    nombre: "Acindar",
    category: "Materiales",
    categoria: "Materiales",
    email: "ventas@acindar.com",
    phone: "+54 11 4000-1000",
    address: "Av. Leandro N. Alem 1067, CABA",
    isActive: true,
    createdAt: "2023-01-15T00:00:00Z",
  },
  {
    id: "sup-002",
    name: "Aluar",
    nombre: "Aluar",
    category: "Aberturas",
    categoria: "Aberturas",
    email: "comercial@aluar.com",
    phone: "+54 11 4000-2000",
    address: "Av. Corrientes 1234, CABA",
    isActive: true,
    createdAt: "2023-02-10T00:00:00Z",
  },
  {
    id: "sup-003",
    name: "Cemento Avellaneda",
    nombre: "Cemento Avellaneda",
    category: "Materiales",
    categoria: "Materiales",
    email: "ventas@cementoavellaneda.com",
    phone: "+54 11 4000-3000",
    isActive: true,
    createdAt: "2023-03-05T00:00:00Z",
  },
  {
    id: "sup-004",
    name: "Hierros del Sur",
    nombre: "Hierros del Sur",
    category: "Materiales",
    categoria: "Materiales",
    email: "info@hierrosdelsur.com",
    phone: "+54 11 4000-4000",
    isActive: true,
    createdAt: "2023-04-12T00:00:00Z",
  },
];

// ============================================
// DATOS DUMMY - CONTABILIDAD
// ============================================
export const SIMULATED_ACCOUNTING_ENTRIES = [
  {
    id: "acc-001",
    workId: "ob-001",
    obraId: "ob-001",
    supplierId: "sup-001",
    proveedorId: "sup-001",
    type: "egreso",
    tipo: "egreso",
    amount: 425000,
    monto: 425000,
    category: "Materiales",
    categoria: "Materiales",
    date: "2024-02-12",
    fecha: "2024-02-12",
    notes: "Compra de acero estructural",
    notas: "Compra de acero estructural",
    description: "Compra de acero estructural",
    descripcion: "Compra de acero estructural",
    createdAt: "2024-02-12T10:30:00Z",
    updatedAt: "2024-02-12T10:30:00Z",
  },
  {
    id: "acc-002",
    workId: "ob-001",
    obraId: "ob-001",
    type: "ingreso",
    tipo: "ingreso",
    amount: 800000,
    monto: 800000,
    category: "Pago cliente",
    categoria: "Pago cliente",
    date: "2024-02-05",
    fecha: "2024-02-05",
    notes: "Pago anticipado cliente",
    notas: "Pago anticipado cliente",
    description: "Pago anticipado cliente",
    descripcion: "Pago anticipado cliente",
    createdAt: "2024-02-05T14:20:00Z",
    updatedAt: "2024-02-05T14:20:00Z",
  },
  {
    id: "acc-003",
    workId: "ob-003",
    obraId: "ob-003",
    supplierId: "sup-002",
    proveedorId: "sup-002",
    type: "egreso",
    tipo: "egreso",
    amount: 320000,
    monto: 320000,
    category: "Aberturas",
    categoria: "Aberturas",
    date: "2024-02-08",
    fecha: "2024-02-08",
    notes: "Ventanas y puertas",
    notas: "Ventanas y puertas",
    description: "Ventanas y puertas",
    descripcion: "Ventanas y puertas",
    createdAt: "2024-02-08T09:15:00Z",
    updatedAt: "2024-02-08T09:15:00Z",
  },
  {
    id: "acc-004",
    workId: "ob-001",
    obraId: "ob-001",
    supplierId: "sup-003",
    proveedorId: "sup-003",
    type: "egreso",
    tipo: "egreso",
    amount: 185000,
    monto: 185000,
    category: "Materiales",
    categoria: "Materiales",
    date: "2024-02-14",
    fecha: "2024-02-14",
    notes: "Cemento y agregados",
    notas: "Cemento y agregados",
    description: "Cemento y agregados",
    descripcion: "Cemento y agregados",
    createdAt: "2024-02-14T11:00:00Z",
    updatedAt: "2024-02-14T11:00:00Z",
  },
  {
    id: "acc-005",
    workId: "ob-003",
    obraId: "ob-003",
    type: "ingreso",
    tipo: "ingreso",
    amount: 1500000,
    monto: 1500000,
    category: "Pago cliente",
    categoria: "Pago cliente",
    date: "2024-02-10",
    fecha: "2024-02-10",
    notes: "Segunda cuota proyecto",
    notas: "Segunda cuota proyecto",
    description: "Segunda cuota proyecto",
    descripcion: "Segunda cuota proyecto",
    createdAt: "2024-02-10T16:45:00Z",
    updatedAt: "2024-02-10T16:45:00Z",
  },
];

// ============================================
// DATOS DUMMY - CAJAS
// ============================================
export const SIMULATED_CASHBOXES = [
  {
    id: "cbx-001",
    name: "Caja Obra Náutica",
    workId: "ob-001",
    createdAt: "2024-02-01T08:00:00Z",
    isClosed: false,
    balance: 125000,
    description: "Caja principal obra Nordelta",
    notes: "Caja para pagos menores y emergencias",
  },
  {
    id: "cbx-002",
    name: "Caja Central",
    createdAt: "2024-01-15T08:00:00Z",
    isClosed: false,
    balance: 45000,
    description: "Caja central de oficina",
  },
  {
    id: "cbx-003",
    name: "Caja Obra Palermo",
    workId: "ob-003",
    createdAt: "2023-11-20T08:00:00Z",
    closedAt: "2024-01-31T18:00:00Z",
    isClosed: true,
    balance: 0,
    description: "Caja cerrada - Obra finalizada",
  },
];

// ============================================
// DATOS DUMMY - MOVIMIENTOS DE CAJA
// ============================================
export const SIMULATED_CASH_MOVEMENTS: Record<string, any[]> = {
  "cbx-001": [
    {
      id: "mov-001",
      cashboxId: "cbx-001",
      type: "egreso",
      amount: 12000,
      category: "Herramientas",
      date: "2024-02-14",
      notes: "Compra de herramientas menores",
      description: "Compra de herramientas menores",
      supplierId: "sup-004",
      createdAt: "2024-02-14T10:30:00Z",
    },
    {
      id: "mov-002",
      cashboxId: "cbx-001",
      type: "ingreso",
      amount: 50000,
      category: "Reembolso",
      date: "2024-02-10",
      notes: "Reembolso de gastos",
      description: "Reembolso de gastos",
      createdAt: "2024-02-10T14:20:00Z",
    },
    {
      id: "mov-003",
      cashboxId: "cbx-001",
      type: "egreso",
      amount: 8500,
      category: "Combustible",
      date: "2024-02-12",
      notes: "Combustible para vehículos obra",
      description: "Combustible para vehículos obra",
      createdAt: "2024-02-12T08:15:00Z",
    },
  ],
  "cbx-002": [
    {
      id: "mov-004",
      cashboxId: "cbx-002",
      type: "ingreso",
      amount: 30000,
      category: "Fondo inicial",
      date: "2024-01-15",
      notes: "Fondo inicial caja central",
      description: "Fondo inicial caja central",
      createdAt: "2024-01-15T09:00:00Z",
    },
    {
      id: "mov-005",
      cashboxId: "cbx-002",
      type: "egreso",
      amount: 15000,
      category: "Oficina",
      date: "2024-02-01",
      notes: "Materiales de oficina",
      description: "Materiales de oficina",
      createdAt: "2024-02-01T11:30:00Z",
    },
  ],
};

// ============================================
// DATOS DUMMY - GASTOS (EXPENSES)
// ============================================
export const SIMULATED_EXPENSES = [
  {
    id: "exp-001",
    workId: "ob-001",
    supplierId: "sup-001",
    amount: 425000,
    category: "Materiales",
    date: "2024-02-12",
    description: "Compra de acero estructural",
    status: "paid",
    createdAt: "2024-02-12T10:30:00Z",
  },
  {
    id: "exp-002",
    workId: "ob-003",
    supplierId: "sup-002",
    amount: 320000,
    category: "Aberturas",
    date: "2024-02-08",
    description: "Ventanas y puertas",
    status: "pending",
    createdAt: "2024-02-08T09:15:00Z",
  },
];

// ============================================
// DATOS DUMMY - INGRESOS (INCOMES)
// ============================================
export const SIMULATED_INCOMES = [
  {
    id: "inc-001",
    workId: "ob-001",
    amount: 800000,
    category: "Pago cliente",
    date: "2024-02-05",
    description: "Pago anticipado cliente",
    status: "received",
    createdAt: "2024-02-05T14:20:00Z",
  },
  {
    id: "inc-002",
    workId: "ob-003",
    amount: 1500000,
    category: "Pago cliente",
    date: "2024-02-10",
    description: "Segunda cuota proyecto",
    status: "received",
    createdAt: "2024-02-10T16:45:00Z",
  },
];

// ============================================
// DATOS DUMMY - CONTRATOS
// ============================================
export const SIMULATED_CONTRACTS = [
  {
    id: "ctr-001",
    workId: "ob-001",
    supplierId: "sup-001",
    status: "active",
    startDate: "2024-01-10",
    endDate: "2024-06-30",
    amount: 2500000,
    description: "Contrato de materiales para obra Nordelta",
    createdAt: "2024-01-10T00:00:00Z",
  },
  {
    id: "ctr-002",
    workId: "ob-003",
    supplierId: "sup-002",
    status: "active",
    startDate: "2023-11-15",
    endDate: "2024-05-15",
    amount: 1800000,
    description: "Contrato de aberturas",
    createdAt: "2023-11-15T00:00:00Z",
  },
  {
    id: "ctr-003",
    workId: "ob-001",
    supplierId: "sup-003",
    status: "completed",
    startDate: "2024-01-15",
    endDate: "2024-02-15",
    amount: 500000,
    description: "Contrato de cemento",
    createdAt: "2024-01-15T00:00:00Z",
  },
];

// ============================================
// DATOS DUMMY - CLIENTES (CRM PMD)
// ============================================
export const SIMULATED_CLIENTS = [
  {
    id: "cli-001",
    name: "Agustín Paredes",
    phone: "+54 9 11 5655 2210",
    email: "aparedes@icloud.com",
    projects: ["ob-001"],
    notes: "Cliente de confianza. Prefiere comunicación por WhatsApp.",
    status: "activo",
    createdAt: "2023-12-01T00:00:00Z",
  },
  {
    id: "cli-002",
    name: "Familia Robledo",
    phone: "+54 9 11 7780 4466",
    email: "famrobledo@gmail.com",
    projects: ["ob-002"],
    notes: "Interesados en casa minimalista El Naudir.",
    status: "activo",
    createdAt: "2024-01-15T00:00:00Z",
  },
  {
    id: "cli-003",
    name: "Lago Norte S.A.",
    phone: "+54 11 4850 9910",
    email: "contacto@lagonorte.com",
    projects: [],
    notes: "Cliente corporativo. Solicita documentación formal.",
    status: "inactivo",
    createdAt: "2023-10-20T00:00:00Z",
  },
];

// ============================================
// DATOS DUMMY - DOCUMENTACIÓN POR OBRA
// ============================================
export const SIMULATED_DOCUMENTS = [
  {
    id: "doc-001",
    workId: "ob-001",
    type: "Planos",
    name: "Plano arquitectónico – Planta baja",
    version: "v1.2",
    uploadedAt: "2024-02-10T10:00:00Z",
    uploadedBy: "stf-001",
    status: "aprobado",
    url: "#",
    createdAt: "2024-02-10T10:00:00Z",
  },
  {
    id: "doc-002",
    workId: "ob-001",
    type: "Memoria descriptiva",
    name: "Memoria técnica – Sistema Steel Framing",
    version: "v1.0",
    uploadedAt: "2024-02-08T14:30:00Z",
    uploadedBy: "stf-002",
    status: "en revisión",
    url: "#",
    createdAt: "2024-02-08T14:30:00Z",
  },
  {
    id: "doc-003",
    workId: "ob-002",
    type: "Contrato",
    name: "Contrato de construcción – El Naudir",
    version: "draft",
    uploadedAt: "2024-01-25T09:15:00Z",
    uploadedBy: "stf-003",
    status: "pendiente",
    url: "#",
    createdAt: "2024-01-25T09:15:00Z",
  },
  {
    id: "doc-004",
    workId: "ob-001",
    type: "Planos",
    name: "Plano estructural – Fundaciones",
    version: "v2.0",
    uploadedAt: "2024-02-12T11:20:00Z",
    uploadedBy: "stf-001",
    status: "aprobado",
    url: "#",
    createdAt: "2024-02-12T11:20:00Z",
  },
];

// ============================================
// DATOS DUMMY - ALERTAS (ACTUALIZADAS)
// ============================================
export const SIMULATED_ALERTS = [
  {
    id: "al-001",
    type: "seguro",
    personId: "stf-002",
    workId: "ob-001",
    message: "Seguro de Gustavo Reynoso vence en 7 días",
    severity: "alta",
    date: "2024-02-14",
    title: "Vencimiento de seguro personal",
    read: false,
    createdAt: "2024-02-14T08:00:00Z",
  },
  {
    id: "al-002",
    type: "documentacion",
    workId: "ob-001",
    message: "Memoria técnica Steel Framing pendiente de revisión",
    severity: "media",
    date: "2024-02-12",
    title: "Documentación pendiente",
    read: false,
    createdAt: "2024-02-12T10:30:00Z",
  },
  {
    id: "al-003",
    type: "obra",
    workId: "ob-002",
    message: "Inicio de obra El Naudir retrasado 5 días",
    severity: "alta",
    date: "2024-02-09",
    title: "Retraso en inicio de obra",
    read: true,
    createdAt: "2024-02-09T14:15:00Z",
  },
];

// ============================================
// DATOS DUMMY - USUARIOS PMD
// ============================================
export const SIMULATED_USERS = [
  {
    id: "usr-001",
    email: "admin@pmd.com",
    fullName: "Administrador PMD",
    roleId: "r1",
    role: {
      id: "r1",
      name: "Administrador",
    },
    isActive: true,
    createdAt: "2024-01-10T00:00:00Z",
  },
  {
    id: "usr-002",
    email: "arq.mlopez@pmd.com",
    fullName: "Martín López",
    roleId: "r2",
    role: {
      id: "r2",
      name: "Arquitecto",
    },
    isActive: true,
    createdAt: "2024-01-14T00:00:00Z",
  },
  {
    id: "usr-003",
    email: "g.reynoso@pmd.com",
    fullName: "Gustavo Reynoso",
    roleId: "r3",
    role: {
      id: "r3",
      name: "Jefe de Obra",
    },
    isActive: false,
    createdAt: "2024-01-20T00:00:00Z",
  },
];

// ============================================
// DATOS DUMMY - AUDITORÍA (LOG INTERNO PMD)
// ============================================
export const SIMULATED_AUDIT_LOGS = [
  {
    id: "aud-001",
    user: "admin",
    userName: "Administrador",
    userId: "usr-admin",
    action: "Actualizó datos del proveedor Acindar",
    module: "Proveedores",
    timestamp: "2024-02-13T14:22:00Z",
    details: "Modificación de datos de contacto y dirección",
    before: { email: "ventas@acindar.com", phone: "+54 11 4000-1000" },
    after: { email: "ventas@acindar.com.ar", phone: "+54 11 4000-1001" },
  },
  {
    id: "aud-002",
    user: "stf-001",
    userName: "Martín López",
    userId: "stf-001",
    action: "Subió plano arquitectónico",
    module: "Documentación",
    timestamp: "2024-02-12T18:55:00Z",
    details: "Plano arquitectónico – Planta baja v1.2",
  },
  {
    id: "aud-003",
    user: "admin",
    userName: "Administrador",
    userId: "usr-admin",
    action: "Modificó fecha de inicio de obra",
    module: "Obras",
    timestamp: "2024-02-10T09:14:00Z",
    details: "Cambio de fecha de inicio",
    before: { startDate: "2024-01-05" },
    after: { startDate: "2024-01-10" },
  },
  {
    id: "aud-004",
    user: "stf-002",
    userName: "Gustavo Reynoso",
    userId: "stf-002",
    action: "Registró movimiento de caja",
    module: "Cajas",
    timestamp: "2024-02-14T10:30:00Z",
    details: "Egreso de $12,000 - Herramientas",
  },
  {
    id: "aud-005",
    user: "admin",
    userName: "Administrador",
    userId: "usr-admin",
    action: "Creó nuevo movimiento contable",
    module: "Contabilidad",
    timestamp: "2024-02-12T10:30:00Z",
    details: "Egreso de $425,000 - Materiales - Obra Nordelta",
  },
];

