import { Balanza } from './balanza.model';
import { Empresa } from './empresa.model';
import { Chofer } from './chofer.model';
import { Factoria } from './factoria.model';
import { GuiaDetalle } from './guia_remision_detalle.model';
import { Documento } from './facturacion.model';

export class GuiaRemision {
    id: number;
    serie: string;
    secuencia: string;
    totalCantidad: number;
    totalPeso: number;
    estado: number;
    motivoTraslado: number;
    tarifa: number;
    subTotal: number;
    fechaRemision: Date;
    fechaTraslado: Date;
    fechaRecepcion: Date;
    ticketBalanza: string;
    serieCliente: string;
    secuenciaCliente: string;
    fechaRegistro: Date;
    fechaActualiza: Date;
    usuarioRegistro: string;
    usuarioActualiza: string;
    placaTracto: string;
    placaBombona: string;
    guiaDetalle: GuiaDetalle[];
    balanza: Balanza;
    remitente: Factoria;
    destinatario: Factoria;
    liquidacion: any;
    documento: Documento;
    empresa: Empresa;
    chofer: Chofer;
    idOrigen: string;
    idDestino: string;
    idProducto: string;

    constructor () {

    }



}

export enum EstadoGuia {
    REGISTRADO = 0,
    ANULADO = 1,
};

export enum TipoBusquedaGuias {
    TODOS = 0,
    GUIAS_FACTURADAS = 1,
    GUIAS_NO_FACTURADAS = 2,
};

export interface GrillaGuiaRemision {
    id: number;
    nroguia: string;
    nroSecuencia: string;
    fechaEmision: string;
    usuarioRegistra: string;
    nroLiq: string;
    ordenServicio: string;
    remitente: string;
    destinatario: string;
    estado: string;
    producto: string;
    cantidad: string;
    chofer: string;
    nroGuiaCliente: string;
    fechaRecepcion: string;
}


export interface GuiaRemisionReportExcel {
    id?: number;
    nroguia?: string;
    nroSecuencia?: string;
    fechaEmision?: Date;
    usuarioRegistra?: string;
    nroLiq?: string;
    ordenServicio?: string;
    remitente?: string;
    destinatario?: string;
    estado?: string;
    producto?: string;
    cantidad?: string;
    chofer?: string;
    nroGuiaCliente?: string;
    factura?: string;
    fechaRecepcion?: string;
    estadoFactura?: string;
}

export class GuiasRemisionPDF {
    id: number;
    fechaTraslado: string;
    guiaRemision: string;
    guiaCliente: string;
    descripcion: string;
    ticketBalanza: string;
    unidadMedida: string;
    cantidad: string;
    tarifa: string;
    subTotal: string;

    constructor () {

    }
}
