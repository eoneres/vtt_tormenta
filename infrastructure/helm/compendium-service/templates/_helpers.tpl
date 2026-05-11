{{/*
Expand the name of the chart.
*/}}
{{- define "compendium-service.name" -}}
{{- default .Chart.Name .Values.nameOverride | trunc 63 | trimSuffix "-" }}
{{- end }}

{{- define "compendium-service.fullname" -}}
{{- .Release.Name }}-{{ include "compendium-service.name" . }}
{{- end }}

{{- define "compendium-service.labels" -}}
helm.sh/chart: {{ .Chart.Name }}-{{ .Chart.Version }}
app.kubernetes.io/name: {{ include "compendium-service.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
app.kubernetes.io/component: backend
app.kubernetes.io/part-of: vtt-platform
{{- end }}

{{- define "compendium-service.selectorLabels" -}}
app.kubernetes.io/name: {{ include "compendium-service.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
app: compendium-service
{{- end }}
