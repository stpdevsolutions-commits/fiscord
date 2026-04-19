#!/bin/bash

# Configuración
BASE_URL="http://localhost:5001/api"
EMAIL="test-$(date +%s)@facturas.com"
PASSWORD="Test1234"
RNC_PROVEEDOR="100002137"

echo "=== PRUEBA GET /api/facturas ==="

# 1. Registrar usuario
echo -e "\n1. Registrando usuario..."
REG_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/register"   -H "Content-Type: application/json"   -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\",\"nombre\":\"Test User\",\"rnc\":\"100002137\",\"empresa\":\"Test Corp\"}")

TOKEN=$(echo "$REG_RESPONSE" | grep -o '"token":"[^"]*' | cut -d'"' -f4)
USER_ID=$(echo "$REG_RESPONSE" | grep -o '"id":"[^"]*' | cut -d'"' -f4 | head -1)

if [ -z "$TOKEN" ]; then
  echo "Error: No se pudo obtener token"
  echo "Response: $REG_RESPONSE"
  exit 1
fi

echo "✅ Usuario registrado"
echo "✅ Token: ${TOKEN:0:20}..."

# 2. GET sin facturas (debería retornar array vacío con paginación correcta)
echo -e "\n2. GET /api/facturas (sin facturas)..."
GET_RESPONSE=$(curl -s -X GET "$BASE_URL/facturas"   -H "Authorization: Bearer $TOKEN"   -H "Content-Type: application/json")

echo "Response:"
echo "$GET_RESPONSE" | jq '.' 2>/dev/null || echo "$GET_RESPONSE"

# 3. GET con paginación personalizada
echo -e "\n3. GET /api/facturas?page=1&limit=10..."
GET_RESPONSE=$(curl -s -X GET "$BASE_URL/facturas?page=1&limit=10"   -H "Authorization: Bearer $TOKEN"   -H "Content-Type: application/json")

echo "Response:"
echo "$GET_RESPONSE" | jq '.pagination' 2>/dev/null || echo "$GET_RESPONSE"

# 4. GET con parámetros inválidos (debería retornar 400)
echo -e "\n4. GET /api/facturas?page=0&limit=150 (inválido - esperado: 400)..."
GET_RESPONSE=$(curl -s -w "\nHTTP_CODE:%{http_code}" -X GET "$BASE_URL/facturas?page=0&limit=150"   -H "Authorization: Bearer $TOKEN"   -H "Content-Type: application/json")

echo "Response:"
echo "$GET_RESPONSE" | jq '.' 2>/dev/null || echo "$GET_RESPONSE"

# 5. GET con sort inválido (debería retornar 400)
echo -e "\n5. GET /api/facturas?sort=invalid:asc (inválido - esperado: 400)..."
GET_RESPONSE=$(curl -s -w "\nHTTP_CODE:%{http_code}" -X GET "$BASE_URL/facturas?sort=invalid:asc"   -H "Authorization: Bearer $TOKEN"   -H "Content-Type: application/json")

echo "Response:"
echo "$GET_RESPONSE" | jq '.' 2>/dev/null || echo "$GET_RESPONSE"

echo -e "\n✅ Pruebas completadas"
