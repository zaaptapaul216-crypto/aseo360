package com.aseo360.aseo360.servicio.implementacion;

import com.aseo360.aseo360.dto.AsistenciaDTO;
import com.aseo360.aseo360.modelo.Asistencia;
import com.aseo360.aseo360.modelo.Empleado;
import com.aseo360.aseo360.repositorio.IAsistenciaRepositorio;
import com.aseo360.aseo360.repositorio.IEmpleadoRepositorio;
import com.aseo360.aseo360.servicio.interfaz.IAsistenciaServicio;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.sql.Time;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class AsistenciaServicio implements IAsistenciaServicio {
    private final IAsistenciaRepositorio asistenciaRepositorio;
    private final IEmpleadoRepositorio empleadoRepositorio;

    @Autowired
    public AsistenciaServicio(IAsistenciaRepositorio asistenciaRepositorio, IEmpleadoRepositorio empleadoRepositorio){
        this.asistenciaRepositorio = asistenciaRepositorio;
        this.empleadoRepositorio = empleadoRepositorio;
    }
    @Override
    public List<AsistenciaDTO> listarAsistencias() throws Exception {
        List<Asistencia> asistencias = this.asistenciaRepositorio.findAll();
        List<AsistenciaDTO> asistenciaDTOS = asistencias.stream().map(
                asistencia -> new AsistenciaDTO(
                        asistencia.getIdAsistencia(),
                        asistencia.getEmpleado().getNombreCompleto(),
                        asistencia.getEmpleado().getCorreo(),
                        asistencia.getEmpleado().getDni(),
                        asistencia.getEmpleado().getNumeroCelular(),
                        asistencia.getFecha(),
                        asistencia.getHoraEntrada(),
                        asistencia.getHoraSalida(),
                        asistencia.getEstado(),
                        asistencia.getComentarios()
                )).toList();
        return asistenciaDTOS;
    }

    @Override
    public List<AsistenciaDTO> listarAsistenciasPorEmpleado(Long id) throws Exception {
        Empleado empleado = this.empleadoRepositorio.findById(id).orElseThrow(()-> new Exception("Error: Empleado no encontrado"));
        List<Asistencia> asistencias = this.asistenciaRepositorio.findByEmpleado(empleado);
        List<AsistenciaDTO> asistenciaDTOS = asistencias.stream().map(
                asistencia -> new AsistenciaDTO(
                        asistencia.getIdAsistencia(),
                        asistencia.getEmpleado().getNombreCompleto(),
                        asistencia.getEmpleado().getCorreo(),
                        asistencia.getEmpleado().getDni(),
                        asistencia.getEmpleado().getNumeroCelular(),
                        asistencia.getFecha(),
                        asistencia.getHoraEntrada(),
                        asistencia.getHoraSalida(),
                        asistencia.getEstado(),
                        asistencia.getComentarios()
                )).toList();

        return asistenciaDTOS;
    }

    @Override
    public Asistencia registrarAsistencia(String correo) throws Exception {
        Asistencia asistencia = new Asistencia();
        LocalDate hoy = LocalDate.now();
        // Obtener la hora actual en la zona horaria de Perú (America/Lima)
        ZoneId zonePeru = ZoneId.of("America/Lima");
        ZonedDateTime horaActualPeru = ZonedDateTime.now(zonePeru);
        // Extraer solo la hora, minutos y segundos
        LocalTime horaLocal = horaActualPeru.toLocalTime();
        // Convertir a java.sql.Time si es necesario
        Time horaActualSql = Time.valueOf(horaLocal);

        Optional<Empleado> empleado = this.empleadoRepositorio.findByCorreo(correo);
        asistencia.setFecha(hoy);
        asistencia.setHoraEntrada(horaActualSql);
        asistencia.setEmpleado(empleado.get());
        asistencia.setEstado("Presente");

        return this.asistenciaRepositorio.save(asistencia);
    }

    @Override
    public Asistencia registrarSalida(Long idAsistencia) throws Exception {
        Asistencia asistencia = this.asistenciaRepositorio.findById(idAsistencia).orElseThrow(()-> new Exception("Error: no se puedo encontrar el registro"));
        // Obtener la hora actual en la zona horaria de Perú (America/Lima)
        ZoneId zonePeru = ZoneId.of("America/Lima");
        ZonedDateTime horaActualPeru = ZonedDateTime.now(zonePeru);
        // Extraer solo la hora, minutos y segundos
        LocalTime horaLocal = horaActualPeru.toLocalTime();
        // Convertir a java.sql.Time si es necesario
        Time horaActualSql = Time.valueOf(horaLocal);

        asistencia.setHoraSalida(horaActualSql);
        return this.asistenciaRepositorio.save(asistencia);
    }

    @Override
    public Asistencia modificarAsistencia(AsistenciaDTO modificarAsistencia) throws Exception {
        Asistencia asistencia = this.asistenciaRepositorio.findById(modificarAsistencia.getIdAsistencia()).orElseThrow(()->new Exception("Error : No existe la asistencia"));
        asistencia.setFecha(modificarAsistencia.getFecha());
        asistencia.setHoraEntrada(modificarAsistencia.getHoraEntrada());
        asistencia.setHoraSalida(modificarAsistencia.getHoraSalida());
        asistencia.setComentarios(modificarAsistencia.getComentario());
        asistencia.setEstado(modificarAsistencia.getEstado());
        return this.asistenciaRepositorio.save(asistencia);
    }

    @Override
    public Asistencia modificarComentario(AsistenciaDTO modificarComentario) throws Exception {
        Asistencia asistencia = this.asistenciaRepositorio.findById(modificarComentario.getIdAsistencia()).orElseThrow(()->new Exception("Error : No existe la asistencia"));
        asistencia.setComentarios(modificarComentario.getComentario());
        return this.asistenciaRepositorio.save(asistencia);
    }

    @Override
    public Asistencia modificarEstado(AsistenciaDTO modificarEstado) throws Exception{
        Asistencia asistencia = this.asistenciaRepositorio.findById(modificarEstado.getIdAsistencia()).orElseThrow(()->new Exception("Error : No existe la asistencia"));
        asistencia.setEstado(modificarEstado.getEstado());
        return this.asistenciaRepositorio.save(asistencia);
    }
}
