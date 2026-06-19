import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import logo from '../../assets/imagenes/logo.png';

const NotaDebito = () => {
    const [modoVista, setModoVista] = useState('form');

    const [notaData, setNotaData] = useState({
        razonSocialEmisor: 'INVERSIONES GENERALES T & C S.A.C.',
        rucEmisor: '206011306963',
        direccionEmisor: 'AV. PRINCIPAL 123 - LIMA',
        logoUrl: logo,
        serie: 'BD01',
        numero: '00000001',
        fechaEmision: new Date().toLocaleDateString('en-CA', { timeZone: 'America/Lima' }),
        moneda: 'SOLES',
        docReferencia: '',
        motivo: 'Intereses por mora',
        clienteNombre: '',
        clienteDoc: '',
        clienteDireccion: '',
        items: [
            { descripcion: '', unidad: 'UND', cantidad: 1, precioUnitario: 0.00, total: 0.00 }
        ],
        subtotal: 0,
        igv: 0,
        importeTotal: 0,
        montoLetras: ''
    });

    useEffect(() => {
        const total = notaData.items.reduce((sum, item) => sum + (parseFloat(item.total) || 0), 0);
        const subtotal = total / 1.18;
        const igv = total - subtotal;

        setNotaData(prev => ({
            ...prev,
            subtotal: subtotal.toFixed(2),
            igv: igv.toFixed(2),
            importeTotal: total.toFixed(2),
            montoLetras: `SON: ${total.toFixed(2)} / 100 SOLES`
        }));
    }, [notaData.items]);

    const handleGenerar = () => {
        toast.info('Nota de Débito GENERADA (pendiente guardar en BD).');
    };

    if (modoVista === 'form') {
        return (
            <div className="container mt-4 mb-5">
                <div className="card shadow border-0">
                    <div className="card-header bg-info text-white d-flex justify-content-between align-items-center py-3">
                        <h5 className="mb-0"><i className="fas fa-plus-square me-2"></i>Nueva Nota de Débito</h5>
                        <div className="d-flex gap-2">
                            <button className="btn btn-dark btn-sm fw-bold border-white" onClick={handleGenerar}>
                                <i className="fas fa-check-circle me-1"></i> Generar
                            </button>
                            <button className="btn btn-light text-info btn-sm fw-bold border-white" onClick={() => setModoVista('preview')}>
                                <i className="fas fa-eye me-1"></i> Vista Previa
                            </button>
                        </div>
                    </div>
                    <div className="card-body bg-light">
                        <div className="row g-3">
                            <div className="col-md-3">
                                <label className="form-label small fw-bold">Serie</label>
                                <input type="text" className="form-control form-control-sm" value={notaData.serie} onChange={(e) => setNotaData({ ...notaData, serie: e.target.value })} />
                            </div>
                            <div className="col-md-3">
                                <label className="form-label small fw-bold">Número</label>
                                <input type="text" className="form-control form-control-sm" value={notaData.numero} onChange={(e) => setNotaData({ ...notaData, numero: e.target.value })} />
                            </div>
                            <div className="col-md-3">
                                <label className="form-label small fw-bold">Doc. Referencia</label>
                                <input type="text" className="form-control form-control-sm" placeholder="F001-0000123" value={notaData.docReferencia} onChange={(e) => setNotaData({ ...notaData, docReferencia: e.target.value })} />
                            </div>
                            <div className="col-md-3">
                                <label className="form-label small fw-bold">Motivo</label>
                                <select className="form-select form-select-sm" value={notaData.motivo} onChange={(e) => setNotaData({ ...notaData, motivo: e.target.value })}>
                                    <option>Intereses por mora</option>
                                    <option>Aumento en el valor</option>
                                    <option>Error en la facturación</option>
                                </select>
                            </div>
                        </div>
                        <div className="mt-4 text-center text-muted">Formulario simplificado para la demostración.</div>
                    </div>
                </div>
            </div>
        );
    }

    return <div className="p-5 text-center">Vista previa en desarrollo... <button className="btn btn-primary" onClick={() => setModoVista('form')}>Volver</button></div>;
};

export default NotaDebito;
