# AuditNux — Centro de Auditoria SAF-T

Ferramenta da Dafilgest para analisar, validar e corrigir ficheiros SAF-T (PT) de faturação.
É um único ficheiro (`index.html`) publicado no GitHub Pages, com acesso por email e palavra-passe através do Firebase.

## Contas e espaços

- **Conta do gabinete (administrador).** Um email e uma palavra-passe gerais que todos os colaboradores da Dafilgest usam. Todos veem e trabalham no mesmo espaço: histórico, correções, valores da DP e definições. Esta conta tem também o separador **Contas da plataforma**.
- **Criar conta.** Qualquer profissional a quem dê o endereço pode criar a sua própria conta no ecrã de entrada. Cada conta nova começa **vazia** e tem o seu **espaço isolado**: não vê nada do gabinete e o gabinete não vê nada dela. A regra é garantida pelas regras de segurança do Firestore, não só pelo programa.
- **Administração.** Em **Contas da plataforma**, a conta do gabinete vê a lista de contas criadas (nome, gabinete, email e data) e pode **suspender** ou **reativar** cada uma. Por privacidade, nunca vê os dados dos outros espaços.
- **Recuperar acesso.** No ecrã de entrada, o separador **Recuperar acesso** envia por email uma ligação para definir nova palavra-passe. Para as contas com email real.

**Os ficheiros SAF-T nunca saem do computador.** São lidos no navegador. Na nuvem só ficam os resumos (mapa de IVA, alertas, pontuação, valores da DP e registo de correções).

---

## Guia de instalação (passo a passo)

Demora cerca de 20 minutos e só se faz uma vez.

### Parte 1 — Criar o projeto Firebase

1. Abra <https://console.firebase.google.com> e entre com a sua conta Google.
2. Clique em **Adicionar projeto** (ou **Criar um projeto**).
3. Nome do projeto: `dafilgest-auditnux`. Clique em **Continuar**.
4. Na página do Google Analytics, **desligue** o interruptor. Clique em **Criar projeto**.
5. Espere cerca de 30 segundos e clique em **Continuar**.

### Parte 2 — Criar o acesso geral (email + palavra-passe)

1. No menu da esquerda, clique em **Criação** (Build) e depois em **Authentication**.
2. Clique em **Começar** (Get started).
3. No separador **Método de início de sessão**, clique em **Email/palavra-passe**.
4. Ligue o **primeiro** interruptor (Email/palavra-passe) e clique em **Guardar**.
5. Abra o separador **Utilizadores** e clique em **Adicionar utilizador**.
6. Escreva o email do acesso geral do gabinete. O AuditNux vem preparado para `dafilgest.sistemas@gmail.com`. Se usar outro email, troque-o também nas regras (Parte 3, passo 7) e no `index.html` (Parte 5, passo 6).
7. Escreva uma palavra-passe forte e guarde-a no Bitwarden.
8. Clique em **Adicionar utilizador**.

### Parte 3 — Criar a base de dados

1. No menu da esquerda, clique em **Criação** e depois em **Firestore Database**.
2. Clique em **Criar base de dados**.
3. Em Localização, escolha **europe-west1 (Bélgica)**. Clique em **Seguinte**.
4. Escolha **Iniciar no modo de produção**. Clique em **Criar**.
5. Quando a base de dados abrir, clique no separador **Regras**.
6. Apague todo o texto que lá está e cole o conteúdo do ficheiro `firestore.rules` (vem junto com este guia).
7. Só se usou outro email na Parte 2: na linha `request.auth.token.email == 'dafilgest.sistemas@gmail.com'`, troque o email pelo que criou.
8. Clique em **Publicar**.

> Porque é que isto é importante: estas regras é que garantem que cada conta só entra no seu próprio espaço. São elas que tornam seguro o botão "Criar conta".

### Parte 4 — Obter a configuração para o AuditNux

1. Clique na **roda dentada** ao lado de "Vista geral do projeto" (canto superior esquerdo) e depois em **Definições do projeto**.
2. Desça até **As suas apps** e clique no ícone **`</>`** (Web).
3. Alcunha da app: `AuditNux`. **Não** marque o Firebase Hosting. Clique em **Registar app**.
4. Aparece um bloco de código com `const firebaseConfig = { apiKey: "...", ... }`. Deixe esta página aberta: vai precisar destes valores na Parte 5.

### Parte 5 — Colocar a configuração no ficheiro

1. Abra o `index.html` no Bloco de Notas (ou no editor do GitHub, Parte 6).
2. Carregue em **Ctrl+F** e procure `FIREBASE_CONFIG`.
3. Vai encontrar este bloco:
   ```js
   const FIREBASE_CONFIG = {
     apiKey: "",
     authDomain: "",
     projectId: "",
     storageBucket: "",
     messagingSenderId: "",
     appId: ""
   };
   ```
4. Copie cada valor da página do Firebase para dentro das aspas correspondentes. Fica algo como `apiKey: "AIzaSy..."`.
5. Só se usou outro email na Parte 2: procure `ADMIN_EMAIL` (Ctrl+F) e troque o email entre aspas.
6. Guarde o ficheiro.

> A `apiKey` do Firebase não é secreta: foi feita para estar no navegador. O que protege os dados são as regras da Parte 3 e a palavra-passe.

### Parte 6 — Publicar no GitHub Pages

1. Abra <https://github.com/new> com a conta `ruidafilgest-sketch`.
2. Repository name: `auditnux`. Deixe **Public** (o GitHub Pages gratuito precisa de repositório público; o código não tem dados de clientes). Clique em **Create repository**.
3. Clique em **uploading an existing file**.
4. Arraste os ficheiros `index.html`, `README.md` e `firestore.rules`. Clique em **Commit changes**.
5. Vá a **Settings**, depois **Pages** (menu da esquerda).
6. Em **Branch**, escolha `main` e a pasta `/ (root)`. Clique em **Save**.
7. Espere 1 a 2 minutos e atualize a página. Aparece o endereço `https://ruidafilgest-sketch.github.io/auditnux/`.

### Parte 7 — Autorizar o endereço no Firebase

1. No Firebase, vá a **Authentication** e depois ao separador **Definições**.
2. Clique em **Domínios autorizados** e depois em **Adicionar domínio**.
3. Escreva `ruidafilgest-sketch.github.io` e clique em **Adicionar**.

### Pronto

Abra `https://ruidafilgest-sketch.github.io/auditnux/` em qualquer posto e entre com o email e a palavra-passe gerais do gabinete. Escreva também o nome do operador (Rui, Beatriz, Filipa…). Fica registado quem analisou e corrigiu cada ficheiro. No primeiro acesso, os dados da Dafilgest já aparecem nos relatórios.

Para partilhar com outro profissional, basta enviar-lhe o mesmo endereço e dizer-lhe para clicar em **Criar conta**.

---

## Utilização rápida

| Separador | Para quê |
|---|---|
| **Importar SAF-T** | Um ficheiro (qualquer tamanho) ou **lote** de vários ficheiros (vários clientes ou meses) |
| **Painel** | Pontuação 0–100, estado (pronto / rever / bloqueado), indicadores, principais alertas, mapa de IVA |
| **Validação** | Mais de 30 regras: taxas inválidas, totais, numeração, ATCUD, Hash, NIF, isenções, consumidor final, classificador por descrição… |
| **Mapa IVA & DP** | Apuramento por região e taxa, campos 1–6 do Quadro 06, confronto com os valores declarados |
| **Correções** | Corrigir taxas linha a linha ou em massa, anular correções, exportar o SAF-T corrigido (verificado automaticamente) |
| **Documentos / Artigos / Clientes** | Exploração com filtros, ordenação e exportação para Excel |
| **Análises de gestão** | Vendas por dia, hora e dia da semana, top artigos e clientes, vendas e anulações por operador, Lei de Benford |
| **Evolução & Comparativos** | Mês a mês e ano a ano (Δ mês anterior, Δ homólogo, acumulado do ano), gráfico ano contra ano anterior, comparar quaisquer períodos (artigos e clientes que sobem, descem, novos e perdidos; taxas; dias; horas; operadores), mapa de calor dia × hora, concentração e curva ABC, PDF de evolução |
| **Relatórios** | PDF de auditoria, mapa de IVA, registo de correções e relatório de vendas para o cliente |
| **Multi-empresa** | Estado de todas as empresas e períodos analisados, a partir de qualquer posto |
| **Definições** | A minha conta (alterar palavra-passe), dados do gabinete nos PDF, logótipo, taxas por região, limites, dicionário do classificador |
| **Contas da plataforma** | Só para a conta do gabinete: lista de contas criadas, suspender ou reativar |

**Importante:** o SAF-T corrigido serve só para importar na contabilidade (CentralGest). A assinatura (Hash) dos documentos alterados deixa de corresponder ao original, por isso este ficheiro **não deve ser submetido à AT**.

Sem configuração Firebase, o AuditNux abre em **modo local**: funciona tudo menos o histórico multi-empresa e a partilha de definições.

## Histórico mensal (Evolução)

Cada SAF-T importado gera automaticamente um **resumo de gestão por mês**: vendas por dia, hora e taxa, os 300 artigos e os 200 clientes principais, e os operadores. O resumo fica guardado no espaço da conta. Um SAF-T anual é dividido sozinho nos 12 meses.

Assim, os comparativos aparecem logo, sem voltar a carregar ficheiros antigos. Para começar com histórico, importe em lote os SAF-T dos últimos 12 a 24 meses de cada cliente (separador Importar, quadro **Importação em lote**).

© Rui Gonçalves — AuditNux v1.2.1
