#!/bin/bash

# Mini-k8s API Test Script
# This script tests the mini-k8s control loop functionality

API_URL="http://localhost:3000"

echo "=== Mini-k8s API Test Script ==="
echo "API URL: $API_URL"
echo ""

# Test 1: Create a pod
echo "Test 1: Creating nginx pod..."
curl -X POST "$API_URL/pods" \
  -H "Content-Type: application/json" \
  -d '{"name":"nginx-pod","image":"nginx:alpine"}' \
  -w "\n"
echo ""
echo ""

# Test 2: Get all pods
echo "Test 2: Getting all pods..."
curl -X GET "$API_URL/pods" \
  -w "\n"
echo ""
echo ""

# Test 3: Wait a few seconds for control loop to process
echo "Waiting 10 seconds for control loop to process the pod..."
sleep 10
echo ""

# Test 4: Get all pods again to see state changes
echo "Test 4: Getting all pods after control loop processing..."
curl -X GET "$API_URL/pods" \
  -w "\n"
echo ""
echo ""

# Test 5: Create another pod
echo "Test 5: Creating redis pod..."
curl -X POST "$API_URL/pods" \
  -H "Content-Type: application/json" \
  -d '{"name":"redis-pod","image":"redis:alpine"}' \
  -w "\n"
echo ""
echo ""

# Test 6: Wait for control loop
echo "Waiting 10 seconds for control loop to process..."
sleep 10
echo ""

# Test 7: Get all pods
echo "Test 7: Getting all pods..."
curl -X GET "$API_URL/pods" \
  -w "\n"
echo ""
echo ""

# Test 8: Stop a pod (set desired_state to STOPPED)
echo "Test 8: Stopping nginx pod..."
# First get the pod ID
POD_ID=$(curl -s "$API_URL/pods" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
echo "Pod ID: $POD_ID"
curl -X PUT "$API_URL/pods/$POD_ID" \
  -H "Content-Type: application/json" \
  -d '{"desiredState":"STOPPED"}' \
  -w "\n"
echo ""
echo ""

# Test 9: Wait for control loop to process the stop
echo "Waiting 10 seconds for control loop to stop the pod..."
sleep 10
echo ""

# Test 10: Get all pods to see final state
echo "Test 10: Getting all pods after stopping..."
curl -X GET "$API_URL/pods" \
  -w "\n"
echo ""
echo ""

echo "=== Test Complete ==="
