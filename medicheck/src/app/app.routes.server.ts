import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  { path: 'editar-tratamiento/:id',  renderMode: RenderMode.Client },
  { path: 'detalle-tratamiento/:id', renderMode: RenderMode.Client },
  { path: 'editar-sintoma/:id',      renderMode: RenderMode.Client },
  { path: 'historial',               renderMode: RenderMode.Client },
  { path: 'list',                    renderMode: RenderMode.Client },
  { path: 'home',                    renderMode: RenderMode.Client },
  { path: 'registrar-sintomas',      renderMode: RenderMode.Client },
  { path: 'ver-sintomas',            renderMode: RenderMode.Client },
  { path: '**',                      renderMode: RenderMode.Client }
];