#!/bin/bash

# Run yarn audit and filter for critical vulnerabilities
result=$(yarn audit --json | jq 'select(.type == "auditAdvisory" and .data.advisory.severity == "critical")')

# Check if any critical vulnerabilities were found
if [ -z "$result" ]; then
    echo "No critical vulnerabilities found."
    exit 0
else
    echo "Critical vulnerabilities found:"
    echo "$result" | jq
    exit 1
fi
