{{/* Resolve app.kubernetes.io/name from labels with a backward-compatible default. */}}
{{- define "component.nameLabel" -}}
{{- default "devspace-app" (get (default dict .Values.labels) "app.kubernetes.io/name") -}}
{{- end -}}
