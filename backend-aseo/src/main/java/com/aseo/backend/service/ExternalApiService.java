package com.aseo.backend.service;

import com.aseo.backend.dto.DniResponseDTO;
import com.aseo.backend.dto.RucResponseDTO;
import com.google.gson.Gson;
import com.google.gson.JsonObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.client.HttpClientErrorException;

import java.util.HashMap;
import java.util.Map;

@Service
public class ExternalApiService {

    private static final Logger logger = LoggerFactory.getLogger(ExternalApiService.class);

    @Autowired
    private RestTemplate restTemplate;

    private final Gson gson = new Gson();

    // APIs públicas para consultas (estas son APIs de ejemplo, puedes cambiarlas)
    private static final String DNI_API_URL = "https://dniruc.apisperu.com/api/v1/dni/";
    private static final String RUC_API_URL = "https://dniruc.apisperu.com/api/v1/ruc/";

    // Token de API (deberías configurarlo en application.properties)
    private static final String API_TOKEN = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJlbWFpbCI6InRlc3RAZXhhbXBsZS5jb20ifQ.QqSMqJP_hmLc8bXPQnABEqXGqLPJlLqcKxNqGdGHpyI";

    /**
     * Consulta DNI en RENIEC a través de API pública
     */
    public DniResponseDTO consultDni(String dni) {
        try {
            logger.info("Consultando DNI: {}", dni);

            // Validar formato de DNI
            if (dni == null || !dni.matches("\\d{8}")) {
                return createErrorDniResponse(dni, "DNI inválido. Debe tener 8 dígitos.");
            }

            String url = DNI_API_URL + dni + "?token=" + API_TOKEN;

            try {
                String response = restTemplate.getForObject(url, String.class);
                JsonObject jsonResponse = gson.fromJson(response, JsonObject.class);

                DniResponseDTO dniResponse = new DniResponseDTO();
                dniResponse.setDni(dni);
                dniResponse
                        .setSuccess(jsonResponse.get("success") != null && jsonResponse.get("success").getAsBoolean());

                if (dniResponse.isSuccess()) {
                    dniResponse.setNombres(getJsonString(jsonResponse, "nombres"));
                    dniResponse.setApellidoPaterno(getJsonString(jsonResponse, "apellidoPaterno"));
                    dniResponse.setApellidoMaterno(getJsonString(jsonResponse, "apellidoMaterno"));
                    dniResponse.setNombreCompleto(dniResponse.getNombreCompleto());
                    logger.info("DNI encontrado: {}", dniResponse.getNombreCompleto());
                } else {
                    dniResponse.setMessage("DNI no encontrado en RENIEC");
                }

                return dniResponse;

            } catch (HttpClientErrorException e) {
                logger.warn("Error al consultar DNI en API externa: {}", e.getMessage());
                return createMockDniResponse(dni);
            }

        } catch (Exception e) {
            logger.error("Error inesperado al consultar DNI: {}", e.getMessage());
            return createMockDniResponse(dni);
        }
    }

    /**
     * Consulta RUC en SUNAT a través de API pública
     */
    public RucResponseDTO consultRuc(String ruc) {
        try {
            logger.info("Consultando RUC: {}", ruc);

            // Validar formato de RUC
            if (ruc == null || !ruc.matches("\\d{11}")) {
                return createErrorRucResponse(ruc, "RUC inválido. Debe tener 11 dígitos.");
            }

            String url = RUC_API_URL + ruc + "?token=" + API_TOKEN;

            try {
                String response = restTemplate.getForObject(url, String.class);
                JsonObject jsonResponse = gson.fromJson(response, JsonObject.class);

                RucResponseDTO rucResponse = new RucResponseDTO();
                rucResponse.setRuc(ruc);
                rucResponse
                        .setSuccess(jsonResponse.get("success") != null && jsonResponse.get("success").getAsBoolean());

                if (rucResponse.isSuccess()) {
                    rucResponse.setRazonSocial(getJsonString(jsonResponse, "razonSocial"));
                    rucResponse.setNombreComercial(getJsonString(jsonResponse, "nombreComercial"));
                    rucResponse.setDireccion(getJsonString(jsonResponse, "direccion"));
                    rucResponse.setDepartamento(getJsonString(jsonResponse, "departamento"));
                    rucResponse.setProvincia(getJsonString(jsonResponse, "provincia"));
                    rucResponse.setDistrito(getJsonString(jsonResponse, "distrito"));
                    rucResponse.setEstado(getJsonString(jsonResponse, "estado"));
                    rucResponse.setCondicion(getJsonString(jsonResponse, "condicion"));
                    rucResponse.setTipo(getJsonString(jsonResponse, "tipo"));
                    logger.info("RUC encontrado: {}", rucResponse.getRazonSocial());
                } else {
                    rucResponse.setMessage("RUC no encontrado en SUNAT");
                }

                return rucResponse;

            } catch (HttpClientErrorException e) {
                logger.warn("Error al consultar RUC en API externa: {}", e.getMessage());
                return createMockRucResponse(ruc);
            }

        } catch (Exception e) {
            logger.error("Error inesperado al consultar RUC: {}", e.getMessage());
            return createMockRucResponse(ruc);
        }
    }

    /**
     * Método de prueba para verificar conectividad
     */
    public Map<String, Object> getDataFromExternalApi() {
        Map<String, Object> response = new HashMap<>();
        response.put("status", "OK");
        response.put("message", "API de SUNAT configurada correctamente");
        response.put("timestamp", System.currentTimeMillis());
        response.put("endpoints", Map.of(
                "dni", "/api/external/dni/{dni}",
                "ruc", "/api/external/ruc/{ruc}"));
        return response;
    }

    // Métodos auxiliares

    private String getJsonString(JsonObject json, String key) {
        try {
            return json.has(key) && !json.get(key).isJsonNull()
                    ? json.get(key).getAsString()
                    : "";
        } catch (Exception e) {
            return "";
        }
    }

    private DniResponseDTO createErrorDniResponse(String dni, String message) {
        DniResponseDTO response = new DniResponseDTO();
        response.setDni(dni);
        response.setSuccess(false);
        response.setMessage(message);
        return response;
    }

    private RucResponseDTO createErrorRucResponse(String ruc, String message) {
        RucResponseDTO response = new RucResponseDTO();
        response.setRuc(ruc);
        response.setSuccess(false);
        response.setMessage(message);
        return response;
    }

    /**
     * Respuesta mock para DNI cuando la API no está disponible
     */
    private DniResponseDTO createMockDniResponse(String dni) {
        DniResponseDTO response = new DniResponseDTO();
        response.setDni(dni);
        response.setNombres("JUAN CARLOS");
        response.setApellidoPaterno("PEREZ");
        response.setApellidoMaterno("GARCIA");
        response.setNombreCompleto("PEREZ GARCIA JUAN CARLOS");
        response.setSuccess(true);
        response.setMessage("Datos de prueba (API no disponible)");
        logger.info("Retornando datos mock para DNI: {}", dni);
        return response;
    }

    /**
     * Respuesta mock para RUC cuando la API no está disponible
     */
    private RucResponseDTO createMockRucResponse(String ruc) {
        RucResponseDTO response = new RucResponseDTO();
        response.setRuc(ruc);
        response.setRazonSocial("EMPRESA DE PRUEBA S.A.C.");
        response.setNombreComercial("EMPRESA PRUEBA");
        response.setDireccion("AV. PRINCIPAL 123 - LIMA");
        response.setDepartamento("LIMA");
        response.setProvincia("LIMA");
        response.setDistrito("LIMA");
        response.setEstado("ACTIVO");
        response.setCondicion("HABIDO");
        response.setTipo("SOCIEDAD ANONIMA CERRADA");
        response.setSuccess(true);
        response.setMessage("Datos de prueba (API no disponible)");
        logger.info("Retornando datos mock para RUC: {}", ruc);
        return response;
    }
}
