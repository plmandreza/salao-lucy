# =========================================================
# Dockerfile — a "receita" da caixa (imagem) do servidor
# Fica junto do código porque é ele que é empacotado.
# Quem usa esta receita é o compose.yaml da pasta "06 - Docker".
# =========================================================

# 1. Ponto de partida: Linux pequeno (Alpine) com Node.js 22 já instalado
FROM node:22-alpine

# 2. Pasta de trabalho dentro da caixa
WORKDIR /app
ENV NODE_ENV=production

# 3. Primeiro só a lista de bibliotecas, depois instala.
#    (Se só o código mudar, o Docker reaproveita esta etapa e o build fica rápido.)
#    "npm ci" instala exatamente as versões do package-lock.json.
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# 4. Agora o código (o .dockerignore impede de copiar node_modules e .env)
COPY . .

# 5. Segurança: não roda como administrador (root), e sim como o usuário "node"
USER node

# 6. Porta em que o servidor escuta DENTRO da caixa
EXPOSE 3000

# 7. Teste de saúde: o Docker pergunta a cada 10 s se o sistema responde.
#    /api/saude só responde OK se o servidor E o banco estiverem funcionando.
HEALTHCHECK --interval=10s --timeout=3s --start-period=15s --retries=5 \
  CMD wget -qO- http://localhost:3000/api/saude || exit 1

# 8. O que roda quando a caixa liga
CMD ["node", "server.js"]
