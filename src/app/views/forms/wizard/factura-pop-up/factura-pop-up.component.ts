import { Component, OnInit, Inject, LOCALE_ID } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatSnackBar, DateAdapter, MAT_DATE_FORMATS } from '@angular/material';
import { Usuario } from '../../../../shared/models/usuario.model';
import { GuiaRemision } from '../../../../shared/models/guia_remision.model';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { ErrorResponse, InfoResponse, FiltrosGuiasLiq } from '../../../../shared/models/error_response.model';
import { Factoria } from '../../../../shared/models/factoria.model';
import { FactoriaService } from '../../../../shared/services/factorias/factoria.service';
import { UsuarioService } from '../../../../shared/services/auth/usuario.service';
import { GuiaRemisionService } from '../../../../shared/services/guias/guia-remision.service';
import { AppLoaderService } from '../../../../shared/services/app-loader/app-loader.service';
import { formatDate } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { ProductoService } from '../../../../shared/services/productos/producto.service';
import { OrdenServicioService } from '../../../../shared/services/liquidacion/orden-servicio.service';
import { AppDateAdapter, APP_DATE_FORMATS } from '../../../../shared/helpers/date.adapter';
import { FacturaItem } from '../../../../shared/models/facturacion.model';
import { Producto } from '../../../../shared/models/producto.model';
import { TiposGenericosService } from '../../../../shared/services/util/tiposGenericos.service';
import { TipoIGV, TipoItem } from '../../../../shared/models/tipos_facturacion';
import { UnidadMedida } from '../../../../shared/models/unidad_medida.model';
import { UnidadMedidaService } from '../../../../shared/services/unidad-medida/unidad-medida.service';

@Component({
  selector: 'app-factura-pop-up',
  templateUrl: './factura-pop-up.component.html',
  styleUrls: ['./factura-pop-up.component.scss'],
  providers: [
    {
        provide: DateAdapter, useClass: AppDateAdapter
    },
    {
        provide: MAT_DATE_FORMATS, useValue: APP_DATE_FORMATS
    }
    ]
})
export class FacturaPopUpComponent implements OnInit {

  rows = [];
  temp = [];
  selected = [];
  columns = [];
  usuarioSession: Usuario;
  listaItemsSelected = [];
  listaItems = [];


  // Ng Model
  formFilter: FormGroup;
  public comboTiposIGV: TipoIGV[]= [];
  public comboTiposItem: TipoItem[]= [];
  public comboUnidades: UnidadMedida[]= [];
  public itemFactura: FacturaItem;

  public valorOrigenSelected_: any;
  public valorDestinoSelected_: any;

  // Manejo default de mensajes en grilla
  messages: any = {
    // Message to show when array is presented
    // but contains no values
    emptyMessage: '-',

    // Footer total message
    totalMessage: 'total',

    // Footer selected message
    selectedMessage: 'seleccionado'
  };

  // Manejo de respuesta
  errorResponse_: ErrorResponse;
  infoResponse_: InfoResponse;

  // Combos para filtros de búsqueda
  comboFactorias: Factoria[];
  comboFactoriasDestino: Factoria[];

  constructor(
    @Inject(LOCALE_ID) private locale: string,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<FacturaPopUpComponent>,
    private factoriaService: FactoriaService,
    private fb: FormBuilder,
    private userService: UsuarioService,
    private productoService: ProductoService,
    private ordenServicioService: OrdenServicioService,
    private guiaRemisionService: GuiaRemisionService,
    private unidadMedidaService: UnidadMedidaService,
    private tiposGenService: TiposGenericosService,
    public snackBar: MatSnackBar,
    private loader: AppLoaderService) {
  }

  ngOnInit() {
    const fechaActual_ = new Date();
    const fechaIniTraslado_ = new Date();
    fechaIniTraslado_.setDate((fechaIniTraslado_.getDate()) - 30);

    this.loader.open();
    this.formFilter = this.fb.group({
      nroOrdenServicio: ['', ],
      filtroFechaIni: new FormControl(fechaIniTraslado_, ),
      filtroFechaFin: new FormControl(fechaActual_, ),
    });


    // Recupera datos de usuario de session
    this.usuarioSession = this.userService.getUserLoggedIn();

    this.unidadMedidaService.listarComboUnidadesMedida().subscribe(data3 => {
      this.comboUnidades = data3;
    });

    // Lista ordenes de servicio por Empresa
    this.ordenServicioService.listarOrdenesServicioPorEmpresa(this.usuarioSession.empresa.id).subscribe(data3 => {
      this.rows = data3;
      console.log(data3);
      this.loader.close();
    });


  }


  pad(number: string, length: number): string {
    let str = '' + number;
    while (str.length < length) {
        str = '0' + str;
    }
    return str;
  }

  // Validar Digitos
  validaDigitos(event) {
    const key = window.event ? event.keyCode : event.which;
      if (event.keyCode === 8 || event.keyCode === 46) {
          return true;
      } else if ( key < 48 || key > 57 ) {
        return false;
      } else {
          return true;
      }
  }


  buscarOrdenServicio() {

    this.selected = [];
    this.loader.open();
    let nroOrden  =  this.formFilter.controls['nroOrdenServicio'].value;
    const fechaIni = formatDate(this.formFilter.controls['filtroFechaIni'].value, 'yyyy-MM-dd', this.locale);
    const fechaFin = formatDate(this.formFilter.controls['filtroFechaFin'].value, 'yyyy-MM-dd', this.locale);

    this.ordenServicioService.listarOrdenesServicioPorFiltro(this.usuarioSession.empresa.id,
                                nroOrden || '',
                                0,
                                0,
                                fechaIni,
                                fechaFin).subscribe(data_ => {
      this.rows = data_;
      this.loader.close();
    },
    (error: HttpErrorResponse) => {
      this.loader.close();
      this.errorResponse_ = error.error;
      this.snackBar.open(this.errorResponse_.errorMessage, 'cerrar', { duration: 5000});
    });

  }

  compareObjects(o1: any, o2: any): boolean {
    return o1.codigo === o2.codigo && o1.id === o2.id;
  }

  onSelect({ selected }) {
    this.listaItemsSelected = selected;

    if (this.listaItemsSelected.length > 1 ){
      this.snackBar.open('Seleccione solo 1 orden de servicio', 'cerrar', { duration: 5000});
    } else {
      this.selected.splice(0, this.selected.length);
      this.selected.push(...selected);
    }

  }

  submit() {

    // Tipos de Afectación IGV
    this.comboTiposIGV = this.tiposGenService.retornarTiposIGV();
    this.comboTiposItem = this.tiposGenService.retornarTiposItemFactura();

    //
    this.listaItemsSelected.forEach(element => {
     let item: FacturaItem = new FacturaItem();
     item.id = element.id;   // temporal
     item.codigo = element.nroOrden;
     item.descripcion = element.glosa;
     item.cantidad = element.totalCantidad;
     item.descuentos = element.descuentos;
     item.factorDescuento = 0;
     // item.productos = new Producto();
     item.subTotal = element.subTotal;
     item.tipoDescuento = 0;
     item.valorIGV = element.igvAplicado;
     item.valorISC = 0.00;
     item.tipoIGV = 1;  // VALOR POR DEFECTO
     item.tipo = this.comboTiposItem[0].id; // VALOR POR DEFECTO
     item.total = element.valorCompra;   // VALOR DE COMPRA PARA APLICAR DESCUENTO
     item.unidadMedida = this.comboUnidades[0]; // VALOR POR DEFECTO
     item.tarifa = element.subTotal / element.totalCantidad ;
     this.itemFactura = item;
    });
    this.dialogRef.close(this.itemFactura);
  }


}