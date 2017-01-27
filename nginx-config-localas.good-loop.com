server {
	listen   80; ## listen for ipv4; this line is default and implied
 
	root /home/daniel/winterwell/adunit; ## Edit your username into this line!
	index index.html;
 
	server_name localas.good-loop.com;
 
	# If there's no static file matching the URI, pass it to the backend
	# $uri/ is necessary so that a request for local.orla.io goes to local.orla.io/$index -> local.orla.io/index.html
	location / {
		try_files $uri $uri/ @backend;
	}
 
	# Port 8484 for Good-Loop AdServer
	location @backend {
		proxy_pass		http://localhost:8484;
		proxy_set_header	X-Real-IP $remote_addr;
		proxy_set_header	X-Forwarded-For $proxy_add_x_forwarded_for;
		proxy_set_header	Host $http_host;
	}
}
