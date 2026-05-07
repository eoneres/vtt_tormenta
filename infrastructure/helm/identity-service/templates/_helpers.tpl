{{/*
Expand the name of the chart.
*/}}
{{- define "identity-service.name" -}}
{{- default .Chart.Name .Values.nameOverride | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Create a default fully qualified app name.
*/}}
{{- define "identity-service.fullname" -}}
{{- if .Values.fullnameOverride }}
{{- .Values.fullnameOverride | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- $name := default .Chart.Name .Values.nameOverride }}
{{- printf "%s-%s" .Release.Name $name | trunc 63 | trimSuffix "-" }}
{{- end }}
{{- end }}

{{/*
Common labels
*/}}
{{- define "identity-service.labels" -}}
helm.sh/chart: {{ include "identity-service.name" . }}-{{ .Chart.Version }}
{{ include "identity-service.selectorLabels" . }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
{{- end }}

{{/*
Selector labels
*/}}
{{- define "identity-service.selectorLabels" -}}
app.kubernetes.io/name: {{ include "identity-service.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
app: identity-service
{{- end }}
