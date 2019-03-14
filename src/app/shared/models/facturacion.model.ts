import { UnidadMedida } from './unidad_medida.model';
import { TipoIGV, TipoItem, FormaPago, Moneda } from './tipos_facturacion';
import { Producto } from './producto.model';
import { Cliente } from './cliente.model';
import { Empresa } from './empresa.model';
import { OrdenServicio } from './orden-servicio';

export class FacturaDocumento {

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
    ordenServicio: OrdenServicio;
    items: FacturaItem;
}


export interface FacturaItem {
    id: number;
    tipo: TipoItem;
    codigo: string;
    descripcion: string;
    cantidad: number;
    tarifa: number;
    tipoDescuento: number;
    factorDescuento: number;
    descuentos: number;
    subtotal: number;
    tipoIGV: TipoIGV;
    valorIGV: number;
    valorISC: number;
    total: number;
    productos: Producto;
    unidadMedida: UnidadMedida;

}
