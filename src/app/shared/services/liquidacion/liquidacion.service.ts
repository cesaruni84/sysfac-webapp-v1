import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { HOST } from '../../helpers/var.constant';
import { Liquidacion } from '../../models/liquidacion.model';

@Injectable({
  providedIn: 'root'
})
export class LiquidacionService {

  url = `${HOST}/empresas/`;

  httpOptions = {
    headers: new HttpHeaders({
      'Content-Type':  'application/json'})
  };

  constructor(private http: HttpClient) { }



  registrarLiquidacionBD(liquidacion: Liquidacion, idEmpresa: number) {
    // let headers = new HttpHeaders({'Content-Type': 'application/json'});
    return this.http.post<any>(this.url + idEmpresa + '/liquidaciones' , liquidacion, this.httpOptions);
  }

  actualizarLiquidacionBD(liquidacion: Liquidacion, idEmpresa: number) {
    // let headers = new HttpHeaders({'Content-Type': 'application/json'});
    return this.http.put<any>(this.url + idEmpresa + '/liquidaciones/' + liquidacion.id, liquidacion, this.httpOptions);
  }


  obtenerLiquidacionPorNroDoc(idEmpresa: number, nroDocLiq: string) {
    const params = new HttpParams().set('nroDocLiq', nroDocLiq);
    return this.http.get<Liquidacion>(this.url + idEmpresa + '/liquidaciones/SRV1', {params: params});
  }

  listarLiquidacionesPorFiltro(idEmpresa: number,
                                nroDocLiq: string,
                                idOrigen: number,
                                idDestino: number,
                                idEstado: number,
                                conFactura: number,
                                 fechaIni: string,
                                 fechaFin: string) {
    const params = new HttpParams().set('nroDocLiq', nroDocLiq.toString())
                                    .set('origen', idDestino.toString())
                                    .set('destino', idDestino.toString())
                                    .set('estado', idEstado.toString())
                                    .set('facturado', conFactura.toString())
                                    .set('fechaIni', fechaIni.toString())
                                    .set('fechaFin', fechaFin.toString());

    return this.http.get<Liquidacion[]>(this.url + idEmpresa + '/liquidaciones/SRV0', { params: params });
  }

}