package com.aseo.backend.controller;

import com.aseo.backend.dto.DniResponseDTO;
import com.aseo.backend.dto.RucResponseDTO;
import com.aseo.backend.service.ExternalApiService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/external")
@CrossOrigin(origins = "*")
public class ExternalApiController {

    @Autowired
    private ExternalApiService externalApiService;

    /**
     * Endpoint de prueba para verificar que la API está funcionando
     * GET /api/external/test
     */
    @GetMapping("/test")
    public ResponseEntity<Map<String, Object>> testExternalApi() {
        return ResponseEntity.ok(externalApiService.getDataFromExternalApi());
    }

    /**
     * Consultar DNI en RENIEC
     * GET /api/external/dni/{dni}
     * Ejemplo: GET /api/external/dni/12345678
     */
    @GetMapping("/dni/{dni}")
    public ResponseEntity<DniResponseDTO> consultDni(@PathVariable String dni) {
        DniResponseDTO response = externalApiService.consultDni(dni);
        return ResponseEntity.ok(response);
    }

    /**
     * Consultar RUC en SUNAT
     * GET /api/external/ruc/{ruc}
     * Ejemplo: GET /api/external/ruc/20123456789
     */
    @GetMapping("/ruc/{ruc}")
    public ResponseEntity<RucResponseDTO> consultRuc(@PathVariable String ruc) {
        RucResponseDTO response = externalApiService.consultRuc(ruc);
        return ResponseEntity.ok(response);
    }

    /**
     * Validar documento (DNI o RUC automáticamente según longitud)
     * GET /api/external/validate/{documento}
     */
    @GetMapping("/validate/{documento}")
    public ResponseEntity<?> validateDocument(@PathVariable String documento) {
        if (documento == null || documento.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "Documento no puede estar vacío"));
        }

        // Eliminar espacios y caracteres no numéricos
        documento = documento.replaceAll("[^0-9]", "");

        if (documento.length() == 8) {
            // Es un DNI
            return ResponseEntity.ok(externalApiService.consultDni(documento));
        } else if (documento.length() == 11) {
            // Es un RUC
            return ResponseEntity.ok(externalApiService.consultRuc(documento));
        } else {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "Documento inválido. Debe tener 8 dígitos (DNI) o 11 dígitos (RUC)"));
        }
    }
}
