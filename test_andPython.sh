#!/bin/bash

echo '============= LOG : auto scaler launched ============='
node test-auto-scaler.js 10 25 
echo '============= LOG : WAITING FOR DATA =============' $(date)
sleep 40
echo '============= LOG : Creating graphs =============' $(date)
python graph.py
echo '============= LOG : FINISHED ============='