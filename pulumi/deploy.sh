#! /usr/bin/bash

rm -rf *.zip;

cd ../self_hosted-n8n;

zip -9 -r -x@.gitignore ../pulumi/n8n-selfhosted.zip ./* && cd ../pulumi && pulumi up;