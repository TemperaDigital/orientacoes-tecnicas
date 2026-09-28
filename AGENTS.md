# Instruções permanentes — Assessoria Técnica COM

Responda em português do Brasil.

## Preferência expressa do proprietário

Manter sincronizados o clone do GitHub e a cópia de publicação no Sites.

- Pasta principal para alterações: `C:\Users\Public\Documents\orientacoes-tecnicas`.
- Repositório: https://github.com/TemperaDigital/orientacoes-tecnicas
- Cópia de publicação: `C:\Users\Eu\Documents\Codex\2026-09-27\sites-plugin-sites-openai-curated-remote\outputs\site`.
- Site existente: `appgprj_6ab9629b0a5881919bd216641dff82e2`.
- Endereço: https://assessoria-tecnica-com.alexandre-guerra51.chatgpt.site/

## Fluxo de trabalho autorizado

1. Conferir o estado das duas pastas e sincronizar o clone com o GitHub antes de editar.
2. Fazer as alterações solicitadas na pasta principal e verificar o resultado.
3. Criar commit e fazer push para o GitHub.
4. Sincronizar os arquivos correspondentes com a cópia de publicação e publicar no mesmo Site, usando as ferramentas de Sites.
5. Confirmar a publicação e o estado da sincronização.

Os arquivos públicos estão na raiz do clone do GitHub e em `dist` na cópia de publicação. Respeitar esse mapeamento; não copiar pastas `.git`, credenciais ou substituir configurações de hospedagem indiscriminadamente. Cada pasta mantém seu próprio histórico e remoto. Atualizar este AGENTS.md nas duas pastas quando esta preferência mudar.

Preservar alterações locais e resolver conflitos antes de sincronizar. Não sobrescrever trabalho divergente, não fazer force push nem apagar arquivos sem confirmação explícita. Manter o acesso privado do Sites, salvo pedido expresso para alterá-lo.

Commit e push no GitHub não publicam automaticamente no Sites: são etapas separadas. Mudanças apenas nas instruções do projeto não exigem republicar o site quando o conteúdo publicado permanece igual.