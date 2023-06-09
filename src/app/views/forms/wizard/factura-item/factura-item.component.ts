import { TiposGenericosService } from './../../../../shared/services/util/tiposGenericos.service';
import { ProductoService } from './../../../../shared/services/productos/producto.service';
import { DocumentoItem } from './../../../../shared/models/facturacion.model';
import { Component, OnInit, Inject, OnDestroy } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { UnidadMedida } from '../../../../shared/models/unidad_medida.model';
import { UnidadMedidaService } from '../../../../shared/services/unidad-medida/unidad-medida.service';
import { TipoIGV } from '../../../../shared/models/tipos_facturacion';
import { Subject, ReplaySubject } from 'rxjs';
import { Producto } from '../../../../shared/models/producto.model';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-factura-item',
  templateUrl: './factura-item.component.html',
  styleUrls: ['./factura-item.component.scss']
})
export class FacturaItemComponent implements OnInit, OnDestroy {

  public itemForm_: FormGroup;
  public comboTiposIGV: TipoIGV[];


  // Ng Model
  tipo_: any;
  productoSelected: any = {};
  unidadMedida_: any = {};
  cantidad_: number;
  tarifa_: number;
  descuentos_: number;
  valorIGV_: number;
  valorISC_: number;

  total_: number;
  subTotal_: number;

  comboTipoProducto = [
    { id: 1, codigo: '001' , descripcion: ' BIEN' },
    { id: 2, codigo: '002' , descripcion: ' SERVICIO' },
  ];

  comboUnidades: UnidadMedida[];
  comboProductos: any [];
  protected _onDestroy = new Subject<void>();
  public productosFiltrados: ReplaySubject<Producto[]> = new ReplaySubject<Producto[]>(1);

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<FacturaItemComponent>,
    private fb: FormBuilder,
    private productoService: ProductoService,
    private unidadMedidaService: UnidadMedidaService,
    private tiposGenService: TiposGenericosService,
  ) { }

  ngOnInit() {
    this.cargaCombos();
    this.defaultValues(this.data.payload);
    this.buildItemForm(this.data.payload);
  }
  buildItemForm(itemFactura: DocumentoItem) {

    this.itemForm_ = this.fb.group({
      productos: [{value: itemFactura.productos || '', disabled: false}],
      productos_: [''],
      tipo: [{value: itemFactura.tipo, disabled: false}],
      codigo: [{value: itemFactura.codigo || '', disabled: false}],
      descripcion: [{value: itemFactura.descripcion || '', disabled: false}],
      cantidad: [{value: '1.00', disabled: false}],
      unidadMedida: [{value: itemFactura.unidadMedida || '', disabled: false}],
      tarifa: [{value: '', disabled: false}],
      descuentos: [{value: '', disabled: false}],
      tipoIGV: [{value: itemFactura.tipoIGV || 1, disabled: false}],
      valorIGV: [{value: '', disabled: true}],
      valorISC: [{value: '', disabled: true}],
      subTotal: [{value: '', disabled: true}],
      total: [{value: '', disabled: true}],
    });
  }

  cargaCombos() {
      // Carga de Combos Unidades de Medida
      this.unidadMedidaService.listarComboUnidadesMedida().subscribe(data3 => {
        this.comboUnidades = data3;
      });

      this.productoService.listarComboProductosServicios(1).subscribe(data_ => {
        this.comboProductos = data_;
        this.productosFiltrados.next(data_.slice());
        // listen for search field value changes
        this.itemForm_.controls['productos_'].valueChanges
          .pipe(takeUntil(this._onDestroy))
          .subscribe(() => {
            this.filtrarProductos();
        });
      });

       // Combo Tipos de Afectación IGV
      this.comboTiposIGV = this.tiposGenService.retornarTiposIGV();

  }
  filtrarProductos() {
    if (!this.comboProductos) {
      return;
    }
    // busca palabra clave
    let search = this.itemForm_.controls['productos_'].value;
    if (!search) {
      this.productosFiltrados.next(this.comboProductos.slice());
      return;
    } else {
      search = search.toLowerCase();
    }
    // filtra
    this.productosFiltrados.next(
      this.comboProductos.filter(producto => producto.descripcion.toLowerCase().indexOf(search) > -1)
    );
  }

  ngOnDestroy() {
    this._onDestroy.next();
    this._onDestroy.complete();
  }

  seleccionarProducto(e: any) {
    this.itemForm_.patchValue({
      tipo: this.productos_form.value.tipo.id,
      codigo: this.productos_form.value.codigo,
      descripcion: this.productos_form.value.descripcion,
      unidadMedida: this.productos_form.value.unidadMedida,
      tarifa: this.productos_form.value.tarifa,
    });


    this.calcularTotal();
  }

  compareObjects(o1: any, o2: any): boolean {
    return o1.valor === o2.valor && o1.id === o2.id;
  }

  compareObjects2(o1: any, o2: any): boolean {
    return o1.codigo === o2.codigo && o1.id === o2.id;
  }

  calcularTotal() {
    const value = (this.tarifa_form.value * this.cantidad_form.value ) - this.descuentos_form.value;
    this.total_ = value;
    this.valorIGV_ = 0.18 * this.total_;
  }

  defaultValues(itemFactura: DocumentoItem) {
    this.cantidad_ = itemFactura.cantidad || 1.00;
    this.tarifa_ = itemFactura.tarifa;
    this.descuentos_ = itemFactura.descuentos || 0.00;
    this.valorIGV_ = itemFactura.valorIGV || 0.00;
    this.total_ = itemFactura.total || 0.00;
    this.valorISC_ = 0.00;
  }

  despuesDigitarTarifa(event: any) {
    const value = (event.target.value * this.cantidad_form.value ) - this.descuentos_form.value;
    if (value  > 0) {
      this.total_ = Number.parseFloat(value.toFixed(2));
      this.valorIGV_ = 0.18 * this.total_;
      this.valorIGV_ = Number.parseFloat(this.valorIGV_.toFixed(2));
    }
  }

  despuesDigitarCantidad(event: any) {
    // console.log(event.target.value );
    const value = (event.target.value * this.tarifa_form.value) - this.descuentos_form.value;
    if (value  > 0) {
      this.total_ = Number.parseFloat(value.toFixed(2));
      this.valorIGV_ = 0.18 * this.total_;
      this.valorIGV_ = Number.parseFloat(this.valorIGV_.toFixed(2));
    }
  }

  despuesDigitarDescuentos(event: any) {
    const value = (this.tarifa_form.value * this.cantidad_form.value ) - event.target.value;
    if (value  > 0) {
      this.total_ = Number.parseFloat(value.toFixed(2));
      this.valorIGV_ = 0.18 * this.total_;
      this.valorIGV_ = Number.parseFloat(this.valorIGV_.toFixed(2));
    }
  }


     /**
   * Getters de campos de formulario
   */
  get tarifa_form (): FormControl {
    return this.itemForm_.get('tarifa') as FormControl;
  }

  get cantidad_form (): FormControl {
    return this.itemForm_.get('cantidad') as FormControl;
  }

  get descuentos_form (): FormControl {
    return this.itemForm_.get('descuentos') as FormControl;
  }

  get productos_form (): FormControl {
    return this.itemForm_.get('productos') as FormControl;
  }




  submit() {
    this.itemForm_.patchValue({
      subTotal: this.total_,
      valorISC: this.valorISC_,

    });
    this.dialogRef.close(this.itemForm_.getRawValue());
  }

}
