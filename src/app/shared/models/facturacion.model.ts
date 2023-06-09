import { UnidadMedida } from './unidad_medida.model';
import { TipoIGV, TipoItem, FormaPago, Moneda } from './tipos_facturacion';
import { Producto } from './producto.model';
import { Cliente } from './cliente.model';
import { Empresa } from './empresa.model';
import { GuiaRemision } from './guia_remision.model';
import { Liquidacion } from './liquidacion.model';

export class Documento {
    id: number;
    tipoDocumento: number;
    serie: string;
    secuencia: string;
    fechaEmision: Date;
    fechaVencimiento: Date;
    nroOrden: string;
    estado: number;
    observacion: string;
    subTotalVentas: number;
    anticipos: number;
    descuentos: number;
    ventaTotal: number;
    isc: number;
    igv: number;
    otrosCargos: number;
    otrosTributos: number;
    totalDocumento: number;
    tipoOperacion: number;
    tipoAfectacion: number;
    envioSunat: number;
    fechaEnvioSunat: Date;
    estadoEnvioSunat: number;
    observacionSunat: string;
    file1Sunat: string;
    file2Sunat: string;
    file3Sunat: string;
    notas: string;
    usuarioRegistro: string;
    usuarioActualiza: string;
    cliente: Cliente;
    empresa: Empresa;
    formaPago: FormaPago;
    moneda: Moneda;
    documentoitemSet: DocumentoItem[];
    liquidaciones: Liquidacion[];
    guiasRemision: GuiaRemision[];
}

export class DocumentoItem {
    id: number;
    tipo: number;
    codigo: string;
    descripcion: string;
    cantidad: number;
    tarifa: number;
    tipoDescuento: number;
    factorDescuento: number;
    descuentos: number;
    subTotal: number;
    tipoIGV: number;
    valorIGV: number;
    valorISC: number;
    total: number;
    productos: Producto;
    unidadMedida: UnidadMedida;
    guiasRemision: GuiaRemision[];
    idRelated: number;   // id de liquidacion o guia remision
}

export enum EstadoDocumento {
    REGISTRADO = 1,
    CANCELADO = 2,
    ANULADO = 3,
};

export enum TipoFactura {
    ITEM = '1',
    CON_LIQUIDACION = '2',
    CON_GUIAREMISION = '3',
};
