http {
  # Backing service instances

  {{#services}}
  upstream {{name}}_services; {
    {{#instances}}
    server {{Address}}:{{Port}} # instance id: {{ID}}
    {{/instances}}
  }

  {{/services}}

  # Proxies
  {{#services}}

  server {
    listen 80;
    server_name {{proxy.domain}};
    location / {
        proxy_pass http://{{name}}_services/;
    }
  }
  {{/services}}
}
