#!/bin/bash

# Supabase Integration End-to-End Test Guide
# ==========================================
# This file documents the complete test flow for the Supabase integration.
# Run these steps manually or use them to guide API testing.

# Prerequisites:
# - Valid Supabase account with OAuth configured
# - Environment variables set: SUPABASE_OAUTH_CLIENT_ID, SUPABASE_OAUTH_CLIENT_SECRET, SUPABASE_OAUTH_REDIRECT_URI
# - Authenticated user session (Clerk user ID)
# - PostgreSQL database running and synced

# Test Flow:

echo "==== Supabase Integration Test Suite ===="

# 1. CHECK CONNECTION STATUS (before OAuth)
echo -e "\n1. Testing GET /api/integrations/supabase (before connection)"
echo "   Expected: isConnected=false"
curl -X GET http://localhost:3000/api/integrations/supabase \
  -H "Cookie: <your-clerk-session-cookie>" \
  -s | jq '.'

# 2. START OAUTH FLOW
echo -e "\n2. Testing POST /api/integrations/supabase (OAuth initiation)"
echo "   Expected: Returns authUrl pointing to Supabase OAuth endpoint"
OAUTH_RESPONSE=$(curl -X POST http://localhost:3000/api/integrations/supabase \
  -H "Cookie: <your-clerk-session-cookie>" \
  -s | jq '.')
echo "$OAUTH_RESPONSE"
AUTH_URL=$(echo "$OAUTH_RESPONSE" | jq -r '.authUrl')
echo "   Auth URL: $AUTH_URL"

# 3. COMPLETE OAUTH MANUALLY
echo -e "\n3. Manual step: Complete OAuth flow"
echo "   Visit this URL in browser: $AUTH_URL"
echo "   After authorization, you'll be redirected to callback and tokens will be stored"
echo "   Wait a moment, then continue..."
read -p "   Press enter once OAuth is complete..."

# 4. CHECK CONNECTION STATUS (after OAuth)
echo -e "\n4. Testing GET /api/integrations/supabase (after OAuth)"
echo "   Expected: isConnected=true, selectedProjectId=null"
curl -X GET http://localhost:3000/api/integrations/supabase \
  -H "Cookie: <your-clerk-session-cookie>" \
  -s | jq '.'

# 5. FETCH USER'S EXISTING PROJECTS
echo -e "\n5. Testing GET /api/integrations/supabase/projects"
echo "   Expected: List of Supabase projects from management API"
PROJECTS=$(curl -X GET http://localhost:3000/api/integrations/supabase/projects \
  -H "Cookie: <your-clerk-session-cookie>" \
  -s | jq '.')
echo "$PROJECTS"
PROJECT_ID=$(echo "$PROJECTS" | jq -r '.projects[0].id // empty')
echo "   First project ID: $PROJECT_ID"

# 6. SELECT AN EXISTING PROJECT
if [ -n "$PROJECT_ID" ]; then
  echo -e "\n6. Testing POST /api/integrations/supabase/select"
  echo "   Selecting project: $PROJECT_ID"
  echo "   Expected: Project selected, credentials fetched (anonKey, serviceRole, apiUrl, dbUrl stored)"
  SELECT_RESPONSE=$(curl -X POST http://localhost:3000/api/integrations/supabase/select \
    -H "Cookie: <your-clerk-session-cookie>" \
    -H "Content-Type: application/json" \
    -d "{\"projectId\": \"$PROJECT_ID\", \"projectName\": \"Test Project\"}" \
    -s | jq '.')
  echo "$SELECT_RESPONSE"
else
  echo -e "\n6. No existing projects found. Skipping select test."
  echo "   Would test: POST /api/integrations/supabase/select"
fi

# 7. FETCH CLIENT CREDENTIALS
echo -e "\n7. Testing GET /api/integrations/supabase/credentials"
echo "   Expected: Returns only anonKey, apiUrl, projectRef (service role NOT included)"
CREDS=$(curl -X GET http://localhost:3000/api/integrations/supabase/credentials \
  -H "Cookie: <your-clerk-session-cookie>" \
  -s | jq '.')
echo "$CREDS"
ANON_KEY=$(echo "$CREDS" | jq -r '.anonKey // empty')
API_URL=$(echo "$CREDS" | jq -r '.apiUrl // empty')

# 8. PERFORM A QUERY OPERATION
if [ -n "$ANON_KEY" ] && [ -n "$API_URL" ]; then
  echo -e "\n8. Testing POST /api/integrations/supabase/query"
  echo "   Performing a SELECT query on 'users' table (or any existing table)"
  echo "   Expected: Real data returned from Supabase, or table not found error (both valid)"
  
  QUERY_RESPONSE=$(curl -X POST http://localhost:3000/api/integrations/supabase/query \
    -H "Cookie: <your-clerk-session-cookie>" \
    -H "Content-Type: application/json" \
    -d '{
      "operation": "query",
      "table": "users",
      "select": ["*"],
      "limit": 10
    }' \
    -s | jq '.')
  echo "$QUERY_RESPONSE"
  
  # 8b. Test INSERT
  echo -e "\n8b. Testing INSERT operation"
  echo "   Inserting a test row into 'test_table' (you may need to create this first)"
  INSERT_RESPONSE=$(curl -X POST http://localhost:3000/api/integrations/supabase/query \
    -H "Cookie: <your-clerk-session-cookie>" \
    -H "Content-Type: application/json" \
    -d '{
      "operation": "insert",
      "table": "test_table",
      "data": {
        "name": "test_row",
        "value": 123
      }
    }' \
    -s | jq '.')
  echo "$INSERT_RESPONSE"
  
  # 8c. Test UPDATE with filters
  echo -e "\n8c. Testing UPDATE operation with filters (required)"
  echo "   Expected: Updates rows matching the filter"
  UPDATE_RESPONSE=$(curl -X POST http://localhost:3000/api/integrations/supabase/query \
    -H "Cookie: <your-clerk-session-cookie>" \
    -H "Content-Type: application/json" \
    -d '{
      "operation": "update",
      "table": "test_table",
      "data": {
        "value": 456
      },
      "filters": {
        "id": 1
      }
    }' \
    -s | jq '.')
  echo "$UPDATE_RESPONSE"
  
  # 8d. Test DELETE with filters
  echo -e "\n8d. Testing DELETE operation with filters (required)"
  echo "   Expected: Deletes rows matching the filter (or error if filter missing)"
  DELETE_RESPONSE=$(curl -X POST http://localhost:3000/api/integrations/supabase/query \
    -H "Cookie: <your-clerk-session-cookie>" \
    -H "Content-Type: application/json" \
    -d '{
      "operation": "delete",
      "table": "test_table",
      "filters": {
        "id": 1
      }
    }' \
    -s | jq '.')
  echo "$DELETE_RESPONSE"
else
  echo -e "\n8. Skipping query tests (no credentials fetched)"
fi

# 9. DESELECT PROJECT
echo -e "\n9. Testing POST /api/integrations/supabase/deselect"
echo "   Expected: Project deselected, selectedProjectId=null"
DESELECT=$(curl -X POST http://localhost:3000/api/integrations/supabase/deselect \
  -H "Cookie: <your-clerk-session-cookie>" \
  -H "Content-Type: application/json" \
  -s | jq '.')
echo "$DESELECT"

# 10. VERIFY DESELECTION
echo -e "\n10. Testing GET /api/integrations/supabase (after deselect)"
echo "   Expected: isConnected=true, selectedProjectId=null"
curl -X GET http://localhost:3000/api/integrations/supabase \
  -H "Cookie: <your-clerk-session-cookie>" \
  -s | jq '.'

echo -e "\n==== Test Summary ===="
echo "✓ OAuth connection"
echo "✓ Project listing"
echo "✓ Project selection with credential fetch"
echo "✓ Client credential endpoint (anon key + API URL only)"
echo "✓ Query proxy (SELECT, INSERT, UPDATE with filters, DELETE with filters)"
echo "✓ Project deselection"
echo ""
echo "All tests completed. Check responses above for success/errors."
