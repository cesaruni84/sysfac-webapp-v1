import { Usuario } from '../../../shared/models/usuario.model';
import { BalanzaService } from '../../../shared/services/balanza/balanza.service';
import { ChoferService } from '../../../shared/services/chofer/chofer.service';
import { UnidadMedidaService } from '../../../shared/services/unidad-medida/unidad-medida.service';
import { FactoriaService } from '../../../shared/services/factorias/factoria.service';
import { Balanza } from '../../../shared/models/balanza.model';
import { UnidadMedida } from '../../../shared/models/unidad_medida.model';
import { Producto } from '../../../shared/models/producto.model';
import { Factoria } from '../../../shared/models/factoria.model';
import { Component, OnInit, ViewChild, Optional, Inject, LOCALE_ID, AfterViewInit, OnDestroy } from '@angular/core';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { CustomValidators } from 'ng2-validation';
import { Chofer } from '../../../shared/models/chofer.model';
import { ProductoService } from '../../../shared/services/productos/producto.service';
import { HttpErrorResponse } from '@angular/common/http';
import { throwError } from 'rxjs/internal/observable/throwError';
import { DateAdapter, MAT_DATE_FORMATS, MatDatepickerInputEvent, MatButton, MatProgressBar, MAT_DIALOG_DATA } from '@angular/material';
import { Router, ActivatedRoute } from '@angular/router';
import { UsuarioService } from '../../../shared/services/auth/usuario.service';
import { GuiaRemision, EstadoGuia } from '../../../shared/models/guia_remision.model';
import { GuiaDetalle } from '../../../shared/models/guia_remision_detalle.model';
import { GuiaRemisionService } from '../../../shared/services/guias/guia-remision.service';
import { ErrorResponse, InfoResponse } from '../../../shared/models/error_response.model';
import { MatSnackBar } from '@angular/material';
import { APP_DATE_FORMATS, AppDateAdapter } from '../../../shared/helpers/date.adapter';
import { registerLocaleData } from '@angular/common';
import localeFr from '@angular/common/locales/fr';
import localeFrExtra from '@angular/common/locales/extra/fr';
import { globalCacheBusterNotifier } from 'ngx-cacheable';
import { takeUntil } from 'rxjs/operators';
import { Subject, ReplaySubject, Observable, Subscription } from 'rxjs';
import { AppConfirmService } from '../../../shared/services/app-confirm/app-confirm.service';
import { Liquidacion } from '../../../shared/models/liquidacion.model';
import { Documento } from '../../../shared/models/facturacion.model';


registerLocaleData(localeFr, 'fr-FR', localeFrExtra);

@Component({
  selector: 'app-basic-form',
  templateUrl: './basic-form.component.html',
  styleUrls: ['./basic-form.component.css'],
  providers: [
    {
        provide: DateAdapter, useClass: AppDateAdapter
    },
    {
        provide: MAT_DATE_FORMATS, useValue: APP_DATE_FORMATS
    },
    {
        provide: LOCALE_ID, useValue: 'en-GB'
    },
    ],
})

export class BasicFormComponent implements OnInit , OnDestroy {

  @ViewChild(MatProgressBar) progressBar: MatProgressBar;
  @ViewChild(MatButton) submitButton: MatButton;

  /** Subject that emits when the component has been destroyed. */
  protected _onDestroy = new Subject<void>();
  public productosFiltrados: ReplaySubject<Producto[]> = new ReplaySubject<Producto[]>(1);
  public balanzasFiltrados: ReplaySubject<Balanza[]> = new ReplaySubject<Balanza[]>(1);
  public factoriasOrigenFiltrados: ReplaySubject<Factoria[]> = new ReplaySubject<Factoria[]>(1);
  public factoriasDestinoFiltrados: ReplaySubject<Factoria[]> = new ReplaySubject<Factoria[]>(1);
  public choferesFiltrados: ReplaySubject<Chofer[]> = new ReplaySubject<Chofer[]>(1);

  // Array de Subscriptores
  public subscriptions = [];



  // NgModel
  valorIdGuia_: number;
  valorIdGuiaDetalle_: number;
  valorRucRemitente_: string;
  valorDirRemitente_: string;
  valorRucDestinatario_: string;
  valorDirDestinatario_: string;
  valorChoferSelected_: any;
  valorCertificado_: string;
  valorLicencia_: string;
  valorPlacaTracto_: string;
  valorPlacaBombona_: string;
  valorFechaIniTraslado_:  Date;
  valorFechaEmision_:  Date;
  estadoSelected_: string;
  valorNroSerie_: string;
  valorNroSecuencia_: string;
  inputDisabled: boolean = false;
  valorRemitenteSelected_: any;
  valorDestinatarioSelected_: any;
  valorProductoSelected_: any;
  valorCantidad_: number;
  valorPeso_: number;
  valorUMSelected_: any;
  valorBalanzaSelected_: any;
  valorTicketBalanza_: string;
  valorFechaRecepcion_: Date;
  valorSerieCli_: string;
  valorSecuenciaCli_: string;
  liquidacion: Liquidacion;
  documento: Documento;
  guiaRemisionAnulada: any;
  tarifaGuia: number;

  // Usuario sesionado
  usuarioSession: Usuario;
  errorResponse_: ErrorResponse;
  infoResponse_: InfoResponse;

  // Variables para el listado de los Combos
  comboFactorias: Factoria[];
  comboFactoriasDestino: Factoria[];
  comboProductos: Producto[];
  comboUnidadMedida: UnidadMedida[];
  comboChoferes: Chofer[];
  comboBalanzas: Balanza[];
  guiaDetalle_: GuiaDetalle;
  formData = {};
  basicForm: FormGroup;
  serieQuery: string;
  secuenciaQuery: string;
  edicion: boolean = false;
  inserto: boolean = false;
  actualiza: boolean = false;

  // Objeto a grabar
  guiaRemision: GuiaRemision;
  public guiaRemisionBD: GuiaRemision;

  constructor(private factoriaService: FactoriaService,
              private productoService: ProductoService,
              private unidadMedidaService: UnidadMedidaService,
              private choferService: ChoferService,
              private balanzaService: BalanzaService,
              private userService: UsuarioService,
              private guiaRemisioService: GuiaRemisionService,
              private confirmService: AppConfirmService,
              private route: ActivatedRoute,
              private router: Router,
              public snackBar: MatSnackBar,
              @Optional() @Inject(MAT_DIALOG_DATA) public data_: any ) {

    // Recupera datos de usuario de session
    this.usuarioSession = this.userService.getUserLoggedIn();

  }

  ngOnInit() {

    // Valida Save o Update
    this.validarGrabarActualizar();

    // Carga Formulario
    this.defaultForm();

    // Carga Combos para el Formulario
    this.cargarCombosFormulario();

    // Si es edicion recuperar datos de BD
    if (this.edicion) {
      this.recuperarDatosGuiaBD(this.serieQuery, this.secuenciaQuery);
    }

  }

  ngOnDestroy() {
    this._onDestroy.next();
    this._onDestroy.complete();
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  addSubscriptor(subscription: Subscription) {
    this.subscriptions.push(subscription);
  }


  validarGrabarActualizar() {
    this.route.queryParams.subscribe(params => {
        this.serieQuery = params._serie;
        this.secuenciaQuery = params._secuencia;
        this.edicion = (this.serieQuery && this.secuenciaQuery) != null ;
      }
    );
  }

  recuperarDatosGuiaBD(serie_: string, secuencia_: string ) {
    this.guiaRemisioService.obtenerGuiaRemisionxNroGuia( this.usuarioSession.empresa.id, serie_, secuencia_)
    .subscribe((data_) => {
        this.parsearDatosGuiaRemision(data_);
    }, (error: HttpErrorResponse) => {
      this.handleError(error);
    });
  }

  recuperarDatosGuiaBDPorGuiaCliente(serieCli_: string, secuenciaCli_: string ) {
    this.guiaRemisioService.obtenerGuiaRemisionxNroGuiaCliente( this.usuarioSession.empresa.id, serieCli_, secuenciaCli_)
    .subscribe((data_) => {
        if (data_.estado === EstadoGuia.ANULADO) {

        }
        this.parsearDatosGuiaRemision(data_);
    }, (error: HttpErrorResponse) => {
      this.handleError(error);
    });
  }

  parsearDatosGuiaRemision(data_: GuiaRemision) {
    this.valorIdGuia_ = data_.id || 0;
    this.estadoSelected_ = data_.estado.toString();
    this.valorFechaEmision_ = this.calcularFechaHoraLocal(data_.fechaRemision);
    this.valorFechaIniTraslado_ = this.calcularFechaHoraLocal(data_.fechaTraslado);
    this.valorFechaRecepcion_ = this.calcularFechaHoraLocal(data_.fechaRecepcion);
    this.valorNroSerie_ = data_.serie;
    this.valorNroSecuencia_ = data_.secuencia;

    if (data_.remitente) {
      this.valorRemitenteSelected_ = data_.remitente;
      this.valorRucRemitente_ = data_.remitente.cliente.ruc;
      this.valorDirRemitente_ = data_.remitente.cliente.direccion;
    }

    if (data_.destinatario) {
      this.valorDestinatarioSelected_ = data_.destinatario;
      this.valorRucDestinatario_ = data_.destinatario.cliente.ruc;
      this.valorDirDestinatario_ = data_.destinatario.cliente.direccion;
    }

    if (data_.guiaDetalle[0]) {
      this.valorIdGuiaDetalle_ = data_.guiaDetalle[0].id;
      this.valorProductoSelected_ = data_.guiaDetalle[0].producto;
      this.valorUMSelected_ = data_.guiaDetalle[0].unidadMedida;
    }

    this.valorCantidad_ = data_.totalCantidad;
    this.valorPlacaTracto_ = data_.placaTracto;
    this.valorPlacaBombona_ = data_.placaBombona;

    if (data_.chofer) {
      this.valorChoferSelected_ = data_.chofer;
      this.valorCertificado_ = data_.chofer.certificado;
      this.valorLicencia_ = data_.chofer.licencia;
    }

    if (data_.balanza) {
      this.valorBalanzaSelected_ = data_.balanza;
    }
    this.valorTicketBalanza_ = data_.ticketBalanza || '';
    this.valorSerieCli_ = data_.serieCliente || '';
    this.valorSecuenciaCli_ = data_.secuenciaCliente || '';

    if (data_.estado === EstadoGuia.ANULADO) {
      this.guiaRemisionAnulada = true;
      // this.basicForm.disable();
    }

    this.liquidacion = data_.liquidacion;
    this.documento = data_.documento;
    this.tarifaGuia = data_.tarifa;

  }

  compareObjects(o1: any, o2: any): boolean {
     if (o1 && o2) {
      return o1.id === o2.id;
     }
  }


  defaultForm() {
    const numberPatern = '^[0-9.,]+$';

    this.basicForm = new FormGroup({
      // empresa_: new FormControl('', [Validators.required]),
      empresa_: new FormControl({value: this.usuarioSession.empresa.razonSocial +
                      ' - RUC ' + this.usuarioSession.empresa.ruc, disabled: true}, Validators.required),
      direccion_: new FormControl({value: this.usuarioSession.empresa.dirFiscal, disabled: true}, Validators.required),
      // rucEmpresa_: new FormControl({value: this.usuarioSession.empresa.ruc, disabled: true}, Validators.required),
      estadoSelected: new FormControl({value: '0'}, Validators.required),
      fechaEmision: new FormControl( '', [
        Validators.minLength(10),
        Validators.maxLength(10),
        Validators.required,
        CustomValidators.date
      ]),
      // fechaIniTraslado: new FormControl({value: 'fechaEmision', disabled: true}, Validators.required),
      fechaIniTraslado: new FormControl({value: 'fechaEmision', disabled: true}, Validators.required),
      nroSerie: new FormControl({value: '', disabled: false}, [CustomValidators.digits, Validators.required]),
      nroSecuencia: new FormControl({value: '', disabled: false} , [CustomValidators.digits, Validators.required]),
      remitenteSelected: new FormControl( '', Validators.required),
      rucRemitente_: new FormControl({value: '', disabled: true}, Validators.required),
      direRemitente_: new FormControl({value: '', disabled: true}, Validators.required),
      destinatarioSelected: new FormControl('', Validators.required),
      rucDestinatario_: new FormControl({value: '', disabled: true}, Validators.required),
      direDestinatario_: new FormControl({value: '', disabled: true}, Validators.required),
      productoSelected: new FormControl('', Validators.required),
      productoFiltro: new FormControl('', ),
      origenFiltro: new FormControl('', ),
      destinoFiltro: new FormControl('', ),
      balanzaFiltro: new FormControl('', ),
      choferFiltro: new FormControl('', ),

      cantidad: new FormControl('', [
        Validators.required,
        Validators.pattern(numberPatern)
      ]),
      // peso: new FormControl('', [
      //   Validators.required,
      //   Validators.pattern(numberPatern)
      // ]),
      unidadMedidaSelected: new FormControl('', Validators.required),
      choferSelected: new FormControl('', Validators.required),
      placaTracto: new FormControl('', [
        Validators.minLength(1),
        Validators.maxLength(30),
        Validators.required
       ]),
      placaBombona: new FormControl('', [
        Validators.minLength(1),
        Validators.maxLength(30),
        Validators.required
      ]),
      nroCertificado_: new FormControl({value: '', disabled: true}, Validators.required),
      nroLicencia_: new FormControl({value: '', disabled: true}, Validators.required),
      balanzaSelected: new FormControl('', ),
      nroTicketBal: new FormControl('', [
        Validators.minLength(1),
        Validators.maxLength(30),
      ]),
      nroSerieClie: new FormControl('0', [
        Validators.minLength(1),
        Validators.maxLength(5),
        Validators.required,
        CustomValidators.digits
      ]),
      nroSequenClie: new FormControl('0', [
        Validators.minLength(1),
        Validators.maxLength(8),
        Validators.required,
        CustomValidators.digits
      ]),
      fechaRecepcion: new FormControl('', [
        Validators.minLength(10),
        Validators.maxLength(10),
        Validators.required,
        CustomValidators.date
      ]),
    });

    // Camviar 2
    this.estadoSelected_ = '0';


  }

  cargarCombosFormulario() {
    // Carga de Combos Factorias- Remitente
    const factoriaServiceSub = this.factoriaService.listarComboFactorias('O').subscribe(data1 => {
      this.comboFactorias = data1;
      this.factoriasOrigenFiltrados.next(data1.slice());
      // listen for search field value changes
      this.basicForm.controls['origenFiltro'].valueChanges
        .pipe(takeUntil(this._onDestroy))
        .subscribe(() => {
          this.filtrarFactoriaOrigen();
      });

    });

    this.addSubscriptor(factoriaServiceSub);

    // Carga de Combos Factorias- Destinatario
    const factoriaServiceSub2 = this.factoriaService.listarComboFactorias('D').subscribe(data7 => {
      this.comboFactoriasDestino = data7;
      this.factoriasDestinoFiltrados.next(data7.slice());
      this.basicForm.controls['destinoFiltro'].valueChanges
        .pipe(takeUntil(this._onDestroy))
        .subscribe(() => {
          this.filtrarFactoriaDestino();
      });
    });

    this.addSubscriptor(factoriaServiceSub2);

    // Carga de Combos Productos
    const productoServiceSub = this.productoService.listarComboProductos().subscribe(data2 => {
      this.comboProductos = data2;
      this.productosFiltrados.next(data2.slice());
      this.basicForm.controls[ 'productoFiltro'].valueChanges
        .pipe(takeUntil(this._onDestroy))
        .subscribe(() => {
          this.filtrarProductos();
      });
    },
    (error: HttpErrorResponse) => { // Error del Server
        this.handleError(error);
    });

    this.addSubscriptor(productoServiceSub);


    // Carga de Combos Unidades de Medida -
    const unidadMedidaServiceSub = this.unidadMedidaService.listarComboUnidadesMedida().subscribe(data3 => {
      this.comboUnidadMedida = data3;
      this.basicForm.patchValue({
        unidadMedidaSelected: this.comboUnidadMedida.find(o => o.descripcion === 'TONELADAS'),
      });
    });

    this.addSubscriptor(unidadMedidaServiceSub);

     // Carga de Combos Choferes
    const choferServiceSub = this.choferService.listarComboChoferes(1).subscribe(data4 => {
      this.comboChoferes = data4;
      this.choferesFiltrados.next(data4.slice());
      this.basicForm.controls['choferFiltro'].valueChanges
        .pipe(takeUntil(this._onDestroy))
        .subscribe(() => {
          this.filtrarChoferes();
      });
     });
    this.addSubscriptor(choferServiceSub);


    // Carga de Combos Balanza
    const balanzaServiceSub = this.balanzaService.listarComboBalanzas().subscribe(data5 => {
      this.comboBalanzas = data5;
      this.balanzasFiltrados.next(data5.slice());
      this.basicForm.controls['balanzaFiltro'].valueChanges
        .pipe(takeUntil(this._onDestroy))
        .subscribe(() => {
          this.filtrarBalanzas();
      });
    });
    this.addSubscriptor(balanzaServiceSub);

  }

  seleccionarFactoriaRemitente(e: any) {
      this.valorRucRemitente_ = e.value.ruc;
      this.valorDirRemitente_ = e.value.direccion;
  }

  seleccionarFactoriaDestinatario(e: any) {
    this.valorRucDestinatario_ = e.value.ruc;
    this.valorDirDestinatario_ = e.value.direccion;
  }

  seleccionarChofer(e: any) {
    this.valorCertificado_ = e.value.certificado;
    this.valorLicencia_ = e.value.licencia;
    this.valorPlacaTracto_ = e.value.vehiculo.placaTracto;
    this.valorPlacaBombona_ = e.value.vehiculo.placaBombona;
  }

  /* FILTROS PARA BUSQUEDA EN COMBOS */
  protected filtrarProductos() {
    if (!this.comboProductos) {
      return;
    }
    // busca palabra clave
    let search = this.basicForm.controls['productoFiltro'].value;
    if (!search) {
      this.productosFiltrados.next(this.comboProductos.slice());
      return;
    } else {
      search = search.toLowerCase();
    }
    // filtra
    this.productosFiltrados.next(
      this.comboProductos.filter(producto => producto.nombre.toLowerCase().indexOf(search) > -1)
    );
  }

  protected filtrarFactoriaOrigen() {
    if (!this.comboFactorias) {
      return;
    }
    // busca palabra clave
    let search = this.basicForm.controls['origenFiltro'].value;
    if (!search) {
      this.factoriasOrigenFiltrados.next(this.comboFactorias.slice());
      return;
    } else {
      search = search.toLowerCase();
    }
    // filtra
    this.factoriasOrigenFiltrados.next(
      this.comboFactorias.filter(factoria => factoria.refLarga2.toLowerCase().indexOf(search) > -1)
    );
  }

  protected filtrarFactoriaDestino() {
    if (!this.comboFactoriasDestino) {
      return;
    }
    // busca palabra clave
    let search = this.basicForm.controls['destinoFiltro'].value;
    if (!search) {
      this.factoriasDestinoFiltrados.next(this.comboFactoriasDestino.slice());
      return;
    } else {
      search = search.toLowerCase();
    }
    // filtra
    this.factoriasDestinoFiltrados.next(
      this.comboFactoriasDestino.filter(factoria => factoria.refLarga2.toLowerCase().indexOf(search) > -1)
    );
  }

  protected filtrarBalanzas() {
    if (!this.comboBalanzas) {
      return;
    }
    // busca palabra clave
    let search = this.basicForm.controls['balanzaFiltro'].value;
    if (!search) {
      this.balanzasFiltrados.next(this.comboBalanzas.slice());
      return;
    } else {
      search = search.toLowerCase();
    }
    // filtra
    this.balanzasFiltrados.next(
      this.comboBalanzas.filter(balanza => balanza.descripcion.toLowerCase().indexOf(search) > -1)
    );
  }

  protected filtrarChoferes() {
    if (!this.comboChoferes) {
      return;
    }
    // busca palabra clave
    let search = this.basicForm.controls['choferFiltro'].value;
    if (!search) {
      this.choferesFiltrados.next(this.comboChoferes.slice());
      return;
    } else {
      search = search.toLowerCase();
    }
    // filtra
    this.choferesFiltrados.next(
      this.comboChoferes.filter(chofer => chofer.nombres.toLowerCase().indexOf(search) > -1 ||
                                          chofer.apellidos.toLowerCase().indexOf(search) > -1 )
    );
  }


  // Grabar Guia de Remisión
  grabarGuiaRemision(model: any, isValid: boolean, e: Event) {

   if (this.basicForm.invalid) {
      console.log('hay errores aun');
   }else {
      // Actualiza valores formateados
      if (!this.edicion) {
        this.valorNroSerie_ = this.pad(this.valorNroSerie_, 5) ;
        this.valorNroSecuencia_ = this.pad(this.valorNroSecuencia_, 8) ;
      }

      this.valorSerieCli_ = this.pad(this.valorSerieCli_, 5) ;
      this.valorSecuenciaCli_ = this.pad(this.valorSecuenciaCli_, 8) ;

      // Efectos del cursor.
      // this.submitButton.disabled = true;
      // this.basicForm.disable();
      this.progressBar.mode = 'indeterminate';

      // Prepara objeto a grabar en BD
      this.guiaRemision = new GuiaRemision();
      this.guiaDetalle_ = new GuiaDetalle();
      const liquidacion_ = new Liquidacion();
      const documento_ = new Documento();
      const listaGuias = [];

      this.guiaRemision.serie =  this.valorNroSerie_;
      this.guiaRemision.secuencia = this.valorNroSecuencia_;
      this.guiaRemision.balanza = this.basicForm.get('balanzaSelected').value;
      this.guiaRemision.totalCantidad = this.basicForm.get('cantidad').value;
      // this.guiaRemision.totalPeso = this.basicForm.get('peso').value;
      this.guiaRemision.totalPeso = 0.00;
      this.guiaRemision.motivoTraslado = 2;
      this.guiaDetalle_.id = this.valorIdGuiaDetalle_ ;
      this.guiaDetalle_.producto = this.basicForm.get('productoSelected').value;
      this.guiaDetalle_.cantidad = this.basicForm.get('cantidad').value;
      // this.guiaDetalle_.peso = this.basicForm.get('peso').value;
      this.guiaDetalle_.peso = 0.00;
      this.guiaDetalle_.unidadMedida = this.basicForm.get('unidadMedidaSelected').value;
      listaGuias [0] = this.guiaDetalle_;
      this.guiaRemision.guiaDetalle = listaGuias;

      this.guiaRemision.tarifa = this.tarifaGuia || 0.00;
      this.guiaRemision.ticketBalanza = this.basicForm.get('nroTicketBal').value;
      this.guiaRemision.placaTracto = this.basicForm.get('placaTracto').value;
      this.guiaRemision.placaBombona = this.basicForm.get('placaBombona').value;
      this.guiaRemision.serieCliente = this.valorSerieCli_;
      this.guiaRemision.secuenciaCliente = this.valorSecuenciaCli_;
      this.guiaRemision.usuarioRegistro = this.usuarioSession.codigo;
      this.guiaRemision.usuarioActualiza = this.usuarioSession.codigo;
      this.guiaRemision.estado = this.basicForm.get('estadoSelected').value;

      const fe = new Date(this.basicForm.get('fechaEmision').value);
      fe.setTime(fe.getTime() + fe.getTimezoneOffset() * 60 * 1000);
      this.guiaRemision.fechaRemision = fe;

      const ft = new Date(this.basicForm.get('fechaIniTraslado').value);
      ft.setTime(ft.getTime() + ft.getTimezoneOffset() * 60 * 1000);
      this.guiaRemision.fechaTraslado = ft;

      const fr = new Date(this.basicForm.get('fechaRecepcion').value);
      fr.setTime(fr.getTime() + fr.getTimezoneOffset() * 60 * 1000);
      this.guiaRemision.fechaRecepcion = fr;

      this.guiaRemision.balanza = this.basicForm.get('balanzaSelected').value;
      this.guiaRemision.remitente = this.basicForm.get('remitenteSelected').value;
      this.guiaRemision.destinatario = this.basicForm.get('destinatarioSelected').value;
      this.guiaRemision.empresa = this.usuarioSession.empresa;
      this.guiaRemision.chofer = this.basicForm.get('choferSelected').value;

      if (this.liquidacion) {
        liquidacion_.id = this.liquidacion.id;
        this.guiaRemision.liquidacion = liquidacion_;
      }

      if (this.documento) {
        documento_.id = this.documento.id;
        this.guiaRemision.documento = documento_;
      }

      // console.log('objeto: ' + this.guiaRemision);
      // console.log('Form data are: ' + JSON.stringify(this.guiaRemision));

      if (this.edicion) {
        this.actualizar();
      } else {
        this.insertar();
      }
   }
  }

  insertar() {
    // Manda POST hacia BD AWS
    this.guiaRemisioService.registrarGuiaRemisionBD(this.guiaRemision).subscribe((data_) => {
      this.infoResponse_ = data_;
      this.progressBar.mode = 'determinate';
      this.snackBar.open(this.infoResponse_.alertMessage, 'cerrar', { duration: 5000 , panelClass: ['green-snackbar'] });
      this.inserto = true;
      this.snackBar._openedSnackBarRef.afterDismissed().subscribe(() => {
        this.nuevaGuia();  // redirige a una nueva pantalla
      });
    },
    (error: HttpErrorResponse) => {
      this.progressBar.mode = 'determinate';
      this.submitButton.disabled = false;
      this.basicForm.enable();
      this.errorResponse_ = error.error;
      this.snackBar.open(this.errorResponse_.errorMessage, 'cerrar', { duration: 5000 });
    });
  }

  actualizar() {
    // Manda PUT hacia BD AWS
    this.guiaRemision.id = this.valorIdGuia_;

    this.guiaRemisioService.actualizarGuiaRemisionBD(this.guiaRemision).subscribe((data_) => {
      this.infoResponse_ = data_;
      this.progressBar.mode = 'determinate';
      this.snackBar.open(this.infoResponse_.alertMessage, 'cerrar', { duration: 5000 });
      this.actualiza = true;
    },
    (error: HttpErrorResponse) => {
      this.progressBar.mode = 'determinate';
      this.submitButton.disabled = false;
      this.basicForm.enable();
      this.errorResponse_ = error.error;
      this.snackBar.open(this.errorResponse_.errorMessage, 'cerrar', { duration: 20000,  panelClass: ['blue-snackbar'] });
    });
  }

  /**
   * Consulta de Guia de Pantalla de Registro
   */
  consultarGuia() {
    if (this.basicForm.get('nroSerie').value && this.basicForm.get('nroSecuencia').value ) {
      this.valorNroSerie_ = this.pad(this.basicForm.get('nroSerie').value, 5) ;
      this.valorNroSecuencia_ = this.pad(this.basicForm.get('nroSecuencia').value, 8) ;
      this.recuperarDatosGuiaBD(this.valorNroSerie_, this.valorNroSecuencia_);
      this.edicion = true;
    }
  }

  /**
   * Busca guia en el Sistema, en modo Edicion/ Nuevo
   */
  validaSiExisteGuiaRemision(serie: string, secuencia: string) {
    if (serie && secuencia ) {
      this.guiaRemisioService.buscaGuiaRemisionxNroGuia( this.usuarioSession.empresa.id, serie, secuencia)
      .subscribe((data_) => {
        this.infoResponse_ = data_;
        if (this.infoResponse_.codeMessage === 'GRT102') {
          this.snackBar.open(this.infoResponse_.alertMessage, 'cerrar', {
            verticalPosition: 'top',
            horizontalPosition: 'right',
            duration: 5000
          });
          this.snackBar._openedSnackBarRef.afterDismissed().subscribe(() => {
            this.basicForm.patchValue({
              nroSecuencia: '',
            });
          });
        }
      }, (error: HttpErrorResponse) => {
        this.handleError(error);
      });
    }
  }

    /**
   * Consulta de Guia de Pantalla de Registro
   */
  consultarGuiaCliente() {
    if (this.basicForm.get('nroSerieClie').value && this.basicForm.get('nroSequenClie').value ) {
      this.valorSerieCli_ = this.pad(this.basicForm.get('nroSerieClie').value, 5) ;
      this.valorSecuenciaCli_ = this.pad(this.basicForm.get('nroSequenClie').value, 8) ;
      this.recuperarDatosGuiaBDPorGuiaCliente(this.valorSerieCli_, this.valorSecuenciaCli_);
      this.edicion = true;
    }

  }

    /**
   * Busca guia cliente en el Sistema, en modo Edicion/ Nuevo
   */
  validaSiExisteGuiaRemisionCliente(serie: string, secuencia: string) {
    if (serie && secuencia ) {
      this.guiaRemisioService.buscaGuiaRemisionxNroGuiaCliente( this.usuarioSession.empresa.id, serie, secuencia)
      .subscribe((data_) => {
        this.infoResponse_ = data_;
        if (this.infoResponse_.codeMessage === 'GRT102') {
          this.snackBar.open(this.infoResponse_.alertMessage, 'cerrar', {
            verticalPosition: 'top',
            horizontalPosition: 'right',
            duration: 5000
          });
          // this.snackBar._openedSnackBarRef.afterDismissed().subscribe(() => {
          //   this.basicForm.patchValue({
          //     nroSequenClie: '',
          //   });
          // });
        }
      }, (error: HttpErrorResponse) => {
        this.handleError(error);
      });
    }
  }


  regresar() {
    if (this.inserto || this.actualiza) {
      globalCacheBusterNotifier.next();
    }
    this.redirectTo('/forms/paging');

  }

  anularGuiaRemision() {


    const serie = this.basicForm.controls['nroSerie'].value;
    const secuencia = this.basicForm.controls['nroSecuencia'].value;

    if (serie && secuencia ) {
      const guiaRemisionCancelada = new GuiaRemision();
      const guiaDetalle_ = new GuiaDetalle();
      const listaGuiasDetalle = [];
      guiaRemisionCancelada.id = this.valorIdGuia_;
      guiaRemisionCancelada.serie = serie;
      guiaRemisionCancelada.secuencia = secuencia;

      guiaRemisionCancelada.serieCliente = this.basicForm.get('nroSerieClie').value || '';
      guiaRemisionCancelada.secuenciaCliente = this.basicForm.get('nroSequenClie').value || '';
      guiaRemisionCancelada.estado = EstadoGuia.ANULADO;  // Anulado
      guiaRemisionCancelada.remitente = this.basicForm.get('remitenteSelected').value;
      guiaRemisionCancelada.destinatario = this.basicForm.get('destinatarioSelected').value;
      guiaRemisionCancelada.chofer = this.basicForm.get('choferSelected').value;


      let fe = new Date();
      if (this.basicForm.get('fechaEmision').value) {
         fe = new Date(this.basicForm.get('fechaEmision').value);
         fe.setTime(fe.getTime() + fe.getTimezoneOffset() * 60 * 1000);
      }
      guiaRemisionCancelada.fechaRemision = fe;

      let ft = new Date();
      if (this.basicForm.get('fechaIniTraslado').value) {
        ft = new Date(this.basicForm.get('fechaIniTraslado').value);
        ft.setTime(ft.getTime() + ft.getTimezoneOffset() * 60 * 1000);
      }
      guiaRemisionCancelada.fechaTraslado = ft;

      let fr = new Date();
      if (this.basicForm.get('fechaRecepcion').value) {
        fr = new Date(this.basicForm.get('fechaRecepcion').value);
        fr.setTime(fr.getTime() + fr.getTimezoneOffset() * 60 * 1000);
      }
      guiaRemisionCancelada.fechaRecepcion = fr;
      guiaRemisionCancelada.placaBombona = this.basicForm.get('placaBombona').value || '?';
      guiaRemisionCancelada.placaTracto = this.basicForm.get('placaTracto').value || '?';
      guiaRemisionCancelada.ticketBalanza =  this.basicForm.get('nroTicketBal').value || '?';
      guiaRemisionCancelada.balanza =  this.basicForm.get('balanzaSelected').value ;
      guiaRemisionCancelada.totalCantidad = this.basicForm.get('cantidad').value || 0.00;
      guiaRemisionCancelada.totalPeso = 0.00;
      guiaRemisionCancelada.tarifa = this.tarifaGuia || 0.00;

      // Detalle de Producto
      if (guiaRemisionCancelada.id ) {
        guiaDetalle_.id = this.valorIdGuiaDetalle_;
        guiaDetalle_.producto = this.basicForm.get('productoSelected').value;
        guiaDetalle_.cantidad = this.basicForm.get('cantidad').value || 0.00;
        guiaDetalle_.peso = 0.00;
        guiaDetalle_.unidadMedida = this.basicForm.get('unidadMedidaSelected').value;
        listaGuiasDetalle [0] = guiaDetalle_;
        guiaRemisionCancelada.guiaDetalle = listaGuiasDetalle;
      } else {
        guiaRemisionCancelada.guiaDetalle = [];
      }

      // Datos Complementarios
      guiaRemisionCancelada.empresa = this.usuarioSession.empresa;
      guiaRemisionCancelada.usuarioRegistro = this.usuarioSession.codigo;
      guiaRemisionCancelada.usuarioActualiza = this.usuarioSession.codigo;

      this.confirmService.confirm({message: `Confirma anular la guia de remisión:  ${serie} - ${secuencia} ?`})
        .subscribe(res => {
          if (res) {
            this.guiaRemisioService.anularGuiaRemisionBD(guiaRemisionCancelada).subscribe(data_ => {
              this.infoResponse_ = data_;
              this.basicForm.patchValue({
                estadoSelected: `${EstadoGuia.ANULADO}`
              });
              this.guiaRemisionAnulada = true;
              this.basicForm.disable();
              this.snackBar.open(this.infoResponse_.alertMessage, 'OK', { duration: 5000 });
            },
            (error: HttpErrorResponse) => {
              this.handleError(error);
            });
          }
        });
    }




  }


  /**
   * Redirigir fake
   */
  redirectTo(uri: string) {
    this.router.navigateByUrl('/', {skipLocationChange: true}).then(() =>
    this.router.navigate([uri]));
  }

  /**
   * Nueva Pantalla de Registro
   */
  nuevaGuia() {
    this.redirectTo('/forms/basic');
  }

  onChangeFechaEmision(type: string, event: MatDatepickerInputEvent<Date>) {
    this.valorFechaIniTraslado_ = event.value;
    this.valorFechaRecepcion_ = event.value;
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

  calcularFechaHoraLocal(fechaString: Date): Date {
    if (fechaString) {
      const fe = new Date(fechaString.toString());
      fe.setTime(fe.getTime() + fe.getTimezoneOffset() * 60 * 1000);
      return fe;
    }

  }

  // Completar Zeros
  completarZerosNroSerie(event) {
    const valorDigitado = event.target.value.toLowerCase();
    if (!(valorDigitado === '')) {
      this.valorNroSerie_ = this.pad(valorDigitado, 5);
    };

  }

  // Completar Zeros
 completarZerosNroSecuencia(event) {
    const valorDigitado = event.target.value.toLowerCase();
    if (!(valorDigitado === '')) {
      this.valorNroSecuencia_ = this.pad(valorDigitado, 8);
      this.validaSiExisteGuiaRemision(this.valorNroSerie_, this.valorNroSecuencia_);
    };
  }

  // Completar Zeros
  completarZerosNroSerieCli(event) {
    const valorDigitado = event.target.value.toLowerCase();
    if (!(valorDigitado === '')) {
      this.valorSerieCli_ = this.pad(valorDigitado, 5);
    }
  }

  // Completar Zeros
  completarZerosNroSecuenciaCli(event) {
    const valorDigitado = event.target.value.toLowerCase();
    if (!(valorDigitado === '')) {
      this.valorSecuenciaCli_ = this.pad(valorDigitado, 8);
      this.validaSiExisteGuiaRemisionCliente(this.valorSerieCli_, this.valorSecuenciaCli_);
    }
  }


  calcularFechaHora(fecha: Date): Date {
    const fechaLocal = fecha.toLocaleDateString();  // fecha local
    const fechFormt = fechaLocal.split('/').reverse().join('-');  // fecha en formato YYYY-mm-DDD
    return new Date(fechFormt);
}



  pad(number: string, length: number): string {
    let str = '' + number;
    while (str.length < length) {
        str = '0' + str;
    }
    return str;
  }


  private handleError(error: HttpErrorResponse) {

    if (error.error instanceof ErrorEvent) {
      // A client-side or network error occurred. Handle it accordingly.
      // this.errorResponse_ = error.error;
      this.snackBar.open(this.errorResponse_.errorMessage, 'OK', { duration: 5000 });
      console.error('An error occurred:', error.error.message);
    } else {
      // The backend returned an unsuccessful response code.
      // The response body may contain clues as to what went wrong,
      if (error.error.codeMessage != null ) {
        this.errorResponse_ = error.error;
        this.snackBar.open(this.errorResponse_.errorMessage, 'OK', { duration: 5000 });
      } else {
        this.snackBar.open('Error de comunicación con los servicios. Intenta nuevamente.', 'OK',
                         { duration: 5000 , verticalPosition: 'top', horizontalPosition: 'end'});
        console.error(
          `Backend returned code ${error.status}, ` +
          `body was: ${error.error}`);
      }

    }
    // return an observable with a user-facing error message
    return throwError(
      'Ocurrió un error inesperado, volver a intentar.');
  };
}
