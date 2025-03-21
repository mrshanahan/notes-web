# Copied from: https://www.keycloak.org/server/containers
FROM quay.io/keycloak/keycloak:latest

ENV KEYCLOAK_ADMIN admin
ENV KEYCLOAK_ADMIN_PASSWORD admin

COPY realm-files/ /opt/keycloak/data/import

ENTRYPOINT ["bash", "/opt/keycloak/bin/kc.sh", "start-dev", "--import-realm"]
