{{- define "realtime-gateway-service.name" -}}
{{- default .Chart.Name .Values.nameOverride | trunc 63 | trimSuffix "-" }}
{{- end }}

{{- define "realtime-gateway-service.fullname" -}}
{{- if .Values.fullnameOverride }}
{{- .Values.fullnameOverride | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- $name := default .Chart.Name .Values.nameOverride }}
{{- printf "%s-%s" .Release.Name $name | trunc 63 | trimSuffix "-" }}
{{- end }}
{{- end }}

{{- define "realtime-gateway-service.labels" -}}
helm.sh/chart: {{ include "realtime-gateway-service.name" . }}-{{ .Chart.Version }}
{{ include "realtime-gateway-service.selectorLabels" . }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
{{- end }}

{{- define "realtime-gateway-service.selectorLabels" -}}
app.kubernetes.io/name: {{ include "realtime-gateway-service.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
app: realtime-gateway-service
{{- end }}
