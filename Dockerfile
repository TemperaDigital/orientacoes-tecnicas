FROM node:24-alpine
WORKDIR /app
COPY *.html *.css *.js *.json counter-server.mjs ./
COPY assets ./assets
COPY originais ./originais
COPY paginas ./paginas
COPY brasaoarmas1.jpg ./
ENV NODE_ENV=production PORT=80
USER node
EXPOSE 80
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s CMD node -e "fetch('http://127.0.0.1:80/healthz').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"
CMD ["node", "counter-server.mjs"]
