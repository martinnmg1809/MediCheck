import { Injectable } from '@angular/core';
import { LocalNotifications } from '@capacitor/local-notifications';

@Injectable({ providedIn: 'root' })
export class RecordatoriosService {

  async init(): Promise<void> {
    try {
      await LocalNotifications.requestPermissions();
    } catch (err) {
      console.error('No se pudieron solicitar permisos de notificación:', err);
    }
  }

  // Cancela todas las notificaciones programadas y las vuelve a generar a partir
  // de las tomas pendientes recibidas. Se llama cada vez que cambia el listado de
  // tomas, así no hace falta cancelar notificaciones puntuales al editar/eliminar/verificar.
  async sincronizar(tomas: any[]): Promise<void> {
    try {
      const pendientes = await LocalNotifications.getPending();
      if (pendientes.notifications.length > 0) {
        await LocalNotifications.cancel({ notifications: pendientes.notifications });
      }

      const ahora = new Date();
      const notificaciones = (tomas || [])
        .filter(t => !t.verificado && t.horario_iso && new Date(t.horario_iso) > ahora)
        .map(t => ({
          id: t.toma_id,
          title: 'Hora de tu medicamento',
          body: `${t.nombre_comercial} · ${t.horario_programado}`,
          schedule: { at: new Date(t.horario_iso) }
        }));

      if (notificaciones.length > 0) {
        await LocalNotifications.schedule({ notifications: notificaciones });
      }
    } catch (err) {
      console.error('No se pudieron sincronizar los recordatorios:', err);
    }
  }
}
