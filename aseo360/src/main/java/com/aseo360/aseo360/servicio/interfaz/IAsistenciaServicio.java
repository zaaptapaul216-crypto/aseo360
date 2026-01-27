package com.aseo360.aseo360.servicio.interfaz;

import com.aseo360.aseo360.dto.AsistenciaDTO;
import com.aseo360.aseo360.modelo.Asistencia;

import java.util.List;

public interface IAsistenciaServicio {
    public List<AsistenciaDTO> listarAsistencias() throws Exception;
    public List<AsistenciaDTO> listarAsistenciasPorEmpleado(Long id) throws Exception;
    public Asistencia registrarAsistencia(String correo) throws Exception;
    public Asistencia registrarSalida(Long idAsistencia)throws Exception;
    public Asistencia modificarAsistencia(AsistenciaDTO modificarAsistencia)throws Exception;
    public Asistencia modificarComentario(AsistenciaDTO modificarComentario)throws Exception;
    public Asistencia modificarEstado(AsistenciaDTO modificarEstado)throws Exception;
}
