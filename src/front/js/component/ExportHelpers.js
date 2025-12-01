import Swal from 'sweetalert2';

// ...exportar helpers para CSV/Excel y abrirModalLink...
export const abrirModalLink = (servidor) => {
    if (!servidor || !servidor.link) {
        Swal.fire({
            icon: 'info',
            title: 'Sin Enlace',
            text: `El servidor "${servidor?.nombre || ''}" no tiene un enlace asociado.`,
            confirmButtonColor: "var(--color-primario)",
        });
        return;
    }

    Swal.fire({
        title: "Información del Enlace",
        html: `
            <div style="text-align: left; padding: 0 1rem;">
                <p><strong>Servidor:</strong> ${servidor.nombre || "No disponible"}</p>
                <p><strong>Descripción:</strong> ${servidor.descripcion || "No disponible"}</p>
                <p><strong>Enlace:</strong> <a href="${servidor.link}" target="_blank" rel="noopener noreferrer">${servidor.link}</a></p>
            </div>
        `,
        confirmButtonText: "Cerrar",
        confirmButtonColor: "var(--color-primario)",
    });
};

export const exportarCSV = (servidores) => {
    if (!servidores || !servidores.length) return;
    const csvQuote = (v) => `"${String(v || '').replace(/"/g, '""')}"`;
    const encabezados = `Nombre;Tipo;IP MGMT;VLAN MGMT;IP Real;VLAN REAL;IP Mask/25;Servicio;Ecosistema;Aplicacion;Capa;Ambiente;Balanceador;Dominio;S.O.;Estatus;Descripcion;Link\n`;
    const filas = servidores.map(srv => {
        let aplicacion = '';
        if (Array.isArray(srv.aplicaciones) && srv.aplicaciones.length > 0) {
            const app = srv.aplicaciones[0];
            aplicacion = `${app.nombre} - V${app.version}`;
        } else if (srv.aplicacion) {
            aplicacion = `${srv.aplicacion.nombre} - V${srv.aplicacion.version}`;
        }
        const servicio = srv.servicio?.nombre || (srv.servicios && srv.servicios[0]?.nombre) || '';
        const capa = srv.capa?.nombre || (srv.capas && srv.capas[0]?.nombre) || '';
        const dominio = srv.dominio?.nombre || (srv.dominios && srv.dominios[0]?.nombre) || '';
        const so = srv.sistema_operativo ? `${srv.sistema_operativo.nombre} - V${srv.sistema_operativo.version}` :
            (srv.sistemasOperativos && srv.sistemasOperativos[0] ? `${srv.sistemasOperativos[0].nombre} - V${srv.sistemasOperativos[0].version}` : '');
        const estatus = srv.estatus?.nombre || (srv.estatus && srv.estatus[0]?.nombre) || '';
        const descripcion = srv.descripcion || '';
        const link = srv.link || '';
        const ecosistema = srv.ecosistema?.nombre || (srv.ecosistemas && srv.ecosistemas[0]?.nombre) || '';
        const ambiente = srv.ambiente?.nombre || (srv.ambientes && srv.ambientes[0]?.nombre) || '';

        const cols = [
            srv.nombre || '',
            srv.tipo || '',
            srv.ip_mgmt || '',
            srv.vlan_mgmt || '',
            srv.ip_real || '',
            srv.vlan_real || '',
            srv.ip_mask25 || '',
            servicio,
            ecosistema,
            aplicacion,
            capa,
            ambiente,
            srv.balanceador || '',
            dominio,
            so,
            estatus,
            descripcion,
            link
        ];

        return cols.map(val => csvQuote(val)).join(';');
    }).join("\n");

    const csvContent = `data:text/csv;charset=utf-8,\uFEFF${encodeURI(encabezados + filas)}`;
    const link = document.createElement("a");
    link.setAttribute("href", csvContent);
    link.setAttribute("download", "servidores.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

export const exportarExcel = (servidores) => {
    if (!servidores || !servidores.length) return;
    const estilos = `
        <style>
            body { font-family: Arial, sans-serif; }
            .excel-table { border-collapse: collapse; width: 100%; font-size: 12px; }
            .excel-table th, .excel-table td { border: 1px solid #cccccc; padding: 8px; text-align: center; vertical-align: middle; }
            .excel-table th { background-color: #005A9C; color: #FFFFFF; font-weight: bold; }
            .excel-table tr:nth-child(even) { background-color: #f2f2f2; }
            .header-table { border-collapse: collapse; width: 100%; margin-bottom: 25px; }
            .header-table td { border: none; vertical-align: middle; text-align: left; }
            .main-title { color: #000000; font-size: 28px; font-weight: bold; margin: 0; padding: 0; }
            .sub-title { color: #005A9C; font-size: 14px; font-style: italic; margin: 0; padding: 0; }
        </style>
    `;
    const encabezados = `<tr><th>Nombre</th><th>Tipo</th><th>IP MGMT</th><th>VLAN MGMT</th><th>IP Real</th><th>VLAN REAL</th><th>IP Mask/25</th><th>Servicio</th><th>Ecosistema</th><th>Aplicacion</th><th>Capa</th><th>Ambiente</th><th>Balanceador</th><th>Dominio</th><th>S.O.</th><th>Estatus</th><th>Descripcion</th><th>Link</th></tr>`;
    const filas = servidores.map(srv => {
        let servicio = srv.servicio?.nombre || (srv.servicios && Array.isArray(srv.servicios) && srv.servicios.length > 0 ? srv.servicios[0].nombre : 'N/A');
        let capa = srv.capa?.nombre || (srv.capas && Array.isArray(srv.capas) && srv.capas.length > 0 ? srv.capas[0].nombre : 'N/A');
        let ambiente = srv.ambiente?.nombre || (srv.ambientes && Array.isArray(srv.ambientes) && srv.ambientes.length > 0 ? srv.ambientes[0].nombre : 'N/A');
        let dominio = srv.dominio?.nombre || (srv.dominios && Array.isArray(srv.dominios) && srv.dominios.length > 0 ? srv.dominios[0].nombre : 'N/A');
        let estatus = srv.estatus?.nombre || (srv.estatus && Array.isArray(srv.estatus) && srv.estatus.length > 0 ? srv.estatus[0].nombre : 'N/A');
        let so = '';
        if (srv.sistema_operativo) {
            so = `${srv.sistema_operativo.nombre} - V${srv.sistema_operativo.version}`;
        } else if (srv.sistemasOperativos && Array.isArray(srv.sistemasOperativos) && srv.sistemasOperativos.length > 0) {
            so = `${srv.sistemasOperativos[0].nombre} - V${srv.sistemasOperativos[0].version}`;
        } else {
            so = 'N/A';
        }
        let aplicacion = '';
        if (Array.isArray(srv.aplicaciones) && srv.aplicaciones.length > 0) {
            const app = srv.aplicaciones[0];
            aplicacion = `${app.nombre} - V${app.version}`;
        } else if (srv.aplicacion) {
            aplicacion = `${srv.aplicacion.nombre} - V${srv.aplicacion.version}`;
        }
        let ecosistema = srv.ecosistema?.nombre || (srv.ecosistemas && Array.isArray(srv.ecosistemas) && srv.ecosistemas.length > 0 ? srv.ecosistemas[0].nombre : 'N/A');
        const vlanMgmtCell = `<td style="mso-number-format:'\\@'">${srv.vlan_mgmt || ''}</td>`;
        const vlanRealCell = `<td style="mso-number-format:'\\@'">${srv.vlan_real || ''}</td>`;
        return `<tr>
            <td>${srv.nombre || 'N/A'}</td>
            <td>${srv.tipo || 'N/A'}</td>
            <td>${srv.ip_mgmt || 'N/A'}</td>
            ${vlanMgmtCell}
            <td>${srv.ip_real || 'N/A'}</td>
            ${vlanRealCell}
            <td>${srv.ip_mask25 || 'N/A'}</td>
            <td>${servicio}</td>
            <td>${ecosistema}</td>
            <td>${aplicacion || 'N/A'}</td>
            <td>${capa}</td>
            <td>${ambiente}</td>
            <td>${srv.balanceador || 'N/A'}</td>
            <td>${dominio}</td>
            <td>${so}</td>
            <td>${estatus}</td>
            <td>${srv.descripcion || 'N/A'}</td>
            <td>${srv.link || 'N/A'}</td>
        </tr>`;
    }).join("");
    const plantillaHtml = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40"><head><meta charset="UTF-8">${estilos}</head><body><table class="header-table"><tr><td colspan="14"><h1 class="main-title">Reporte de Servidores</h1></td></tr><tr><td colspan="14"><p class="sub-title">(Gerencia de Operaciones de Canales Virtuales y Medios de Pagos)</p></td></tr></table><table class="excel-table">${encabezados}${filas}</table></body></html>`;
    const excelContent = `data:application/vnd.ms-excel;charset=utf-8,${encodeURIComponent(plantillaHtml)}`;
    const link = document.createElement("a");
    link.setAttribute("href", excelContent);
    link.setAttribute("download", "Reporte_Servidores.xls");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};
