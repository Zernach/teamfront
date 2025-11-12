#!/bin/bash
# Helper script to find or create SSL certificate for Elastic Beanstalk
# This script helps you get the certificate ARN needed for HTTPS configuration

REGION="us-west-1"
DOMAIN="*.elasticbeanstalk.com"  # Wildcard for all EB domains, or use your specific domain

echo "Checking for existing SSL certificates in ${REGION}..."
echo ""

# List existing certificates
CERTIFICATES=$(aws acm list-certificates --region ${REGION} --query 'CertificateSummaryList[*].[CertificateArn,DomainName,Status]' --output table 2>/dev/null)

if [ $? -eq 0 ] && [ -n "$CERTIFICATES" ]; then
    echo "Found existing certificates:"
    echo "$CERTIFICATES"
    echo ""
    echo "To use an existing certificate, copy the CertificateArn and update:"
    echo "  invoice-me/backend/.ebextensions/environment.config"
    echo "  Replace REPLACE_WITH_YOUR_CERTIFICATE_ARN with the actual ARN"
    echo ""
else
    echo "No certificates found or unable to list certificates."
    echo ""
fi

echo "To create a new certificate:"
echo "1. Go to AWS Console -> Certificate Manager (ACM) -> Request a certificate"
echo "2. Select 'Request a public certificate'"
echo "3. Domain name: ${DOMAIN} (or your specific domain)"
echo "4. Validation: DNS validation (recommended) or Email validation"
echo "5. After validation, copy the Certificate ARN"
echo "6. Update invoice-me/backend/.ebextensions/environment.config"
echo ""
echo "Or use AWS CLI to request a certificate:"
echo "  aws acm request-certificate \\"
echo "    --domain-name ${DOMAIN} \\"
echo "    --validation-method DNS \\"
echo "    --region ${REGION}"
echo ""
echo "After requesting, validate the certificate (DNS or email), then get the ARN:"
echo "  aws acm list-certificates --region ${REGION} --query 'CertificateSummaryList[*].[CertificateArn,DomainName,Status]' --output table"

