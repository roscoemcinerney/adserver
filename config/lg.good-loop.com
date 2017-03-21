map $sent_http_content_type $expires {
	default                         off;
        text/html                       epoch;
        text/css                        epoch;
        application/javascript          epoch;
        ~image/                         epoch;
}


server {
	listen 80;
	listen [::]:80;
	listen 443 ssl http2;
	listen [::]:443 ssl http2;

	expires $expires;

	server_name lg.good-loop.com;
	include /home/winterwell/lg.good-loop.com/ssl.lg.good-loop.com.conf;
	include /home/winterwell/lg.good-loop.com/ssl.lg.good-loop.com.params.conf;

	access_log /var/log/nginx/lg.good-loop.com/access.log;
	error_log /var/log/nginx/lg.good-loop.com/error.log;

	root /home/winterwell/lg.good-loop.com;

        location / {
                proxy_pass http://127.0.0.1:8585;
                proxy_set_header X-Real-IP $remote_addr;
                proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
                proxy_http_version 1.1;
                proxy_set_header Upgrade $http_upgrade;
                proxy_set_header Connection 'upgrade';
                proxy_set_header Host $host;
                proxy_cache_bypass $http_upgrade;
                add_header 'Access-Control-Allow-Credentials' 'true';
                add_header 'Access-Control-Allow-Methods' 'GET, POST, OPTIONS';
		add_header 'Access-Control-Allow-Origin' "$http_origin";
        }
	location /site-alive {
		alias /home/winterwell/lg.good-loop.com/web;
		index index.html;
	}
}
