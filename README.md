# AuditNux — Centro de Auditoria SAF-T

Ferramenta da Dafilgest para analisar, validar e corrigir ficheiros SAF-T (PT) de faturação, analisar o SAF-T de contabilidade e preparar o Balanço, a DR, o IRC e a leitura para a banca.
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

## 1.19.2 — lembrar neste computador

- Ao abrir o cofre (senhas) ou os Recebimentos, a opção «Lembrar neste computador» vem marcada: nesse computador não volta a pedir, nem depois de fechar o navegador.
- «Esquecer neste computador» desfaz. Num computador partilhado ou público, desmarque a opção.
- A chave fica guardada no próprio navegador como chave não exportável (não fica em texto em lado nenhum).

## 1.19.1 — acessos da equipa

- A equipa (Filipa, Beatriz) tem acesso total a todos os módulos do Processamento mensal: gerir listas, planos AT, prestações pagas, DMR, SAF-T, IVA, Declarações, Ativos e Calendário.
- O cofre serve só para as senhas AT/SS: fechado, aparecem como «cofre bloqueado»; aberto, aparecem às claras (a palavra-passe do cofre pode ser dada à equipa).
- Recebimentos: chave própria, só do Rui (criada no primeiro acesso); fecham após 30 minutos sem atividade.

## 1.19 — Processamento mensal completo (um só acesso)

- **Processamento mensal** passa a ter: IVA · SAF-T · DMR · SS (o Sistema Interno), Declarações fiscais, Ativos fixos, Calendário da equipa, Recebimentos (só administrador), Renomeação mensal e **Migração e cofre**.
- Os módulos são os de sempre (pasta `proc/`), sem mudanças de lógica; mudou só onde guardam os dados: base do AuditNux (login + regras por espaço). Abertos fora do AuditNux ficam bloqueados.
- **Cofre de senhas**: senhas AT/SS cifradas (AES-GCM 256, chave derivada da palavra-passe do cofre com PBKDF2 250 000 iterações). Cofre aberto = administrador; fecha ao fim de 45 min sem atividade.
- **Migração com conferência**: lê a cópia .json exportada do Realtime Database, copia, volta a ler da nuvem e compara valor a valor. Só marca «migrado» se tudo bater. Pode repetir (substitui).
- Segurança extra: se uma leitura falhar, as gravações ficam bloqueadas até recarregar (nunca grava por cima com dados incompletos); com o cofre fechado, gravar uma ficha não apaga as senhas.
- Correção incluída: mapa da Segurança Social dos independentes (mês do mapa = enquadramento do trimestre; pagar até dia 20 do mês seguinte).
- Ao subir: `index.html`, `README.md` e a **pasta `proc`** (11 ficheiros).

### Passagem (por esta ordem)
1. Subir o AuditNux 1.19 (index.html + pasta proc).
2. Avisar a equipa para não usar o Sistema Interno/Declarações antigos a partir desse momento.
3. Exportar de novo as duas bases (consola Firebase › Realtime Database › ⋮ › Exportar JSON).
4. AuditNux › Processamento mensal › Migração e cofre: criar o cofre; migrar Sistema Interno; migrar Declarações; confirmar «Tudo confere».
5. Trabalhar uns dias só no AuditNux.
6. Desativar os antigos: subir as páginas de encaminhamento (dafilgest-interno, dafilgest-declaracoes), o hub novo, apagar o segredo antigo da base `dafilgest-interno` e fechar as regras das duas bases.

## 1.18 — Processamento mensal (1.º módulo: Renomeação)

- Nova área no menu: **Processamento mensal**, onde vão entrar, um a um, os módulos do Sistema Interno (IVA, SAF-T, DMR/DRI, Independentes SS, Declarações, Ativos, Recebimentos).
- 1.º módulo: **Renomeação mensal**, a mesma página do Sistema Interno (ficheiro `renomeacao.html`, sem alterações), aberta dentro do AuditNux. Não guarda dados.
- Atenção ao subir: este pacote tem **dois ficheiros** — `index.html` e `renomeacao.html`.

## 1.17.2 — qualquer empresa em qualquer quadro de seleção

- Contabilidade e Demonstrações & IRC listam todas as empresas da base, separadas em «Com SAF-T de contabilidade» e «Sem SAF-T de contabilidade».
- A empresa escolhida fica escolhida (deixou de voltar para a anterior). Sem dados, o ecrã mostra como começar: carregar o SAF-T dessa empresa, fazer as contas com o balancete em Excel (fica associado à empresa) ou abrir a ficha.
- Em Demonstrações & IRC, escolher uma empresa com SAF-T carrega logo o balancete do último ano.
- A ficha da empresa tem sempre os botões Contabilidade e Demonstrações & IRC.

## 1.17.1 — cartas de circularização (modelo de pedido de confirmação de saldo)

- Novo modelo, ao estilo dos revisores: destinatário ao cuidado do Departamento de Contabilidade, saldo indicado sem "a nosso/vosso favor", pedido sempre do extrato de conta corrente com o detalhe dos documentos, resposta direta por email para circulacoes.dafilgest@gmail.com no prazo indicado; sem talão de devolução.
- Exportação em PDF (imprimir) e em Word (.docx) editável. Email, "ao cuidado de", prazo e local ficam guardados.

## 1.17 — menu por áreas

- O menu está agrupado em cinco áreas com cor própria: **Gabinete**, **Empresas**, **Faturação** (SAF-T de faturação), **Contabilidade** (SAF-T de contabilidade) e **Saídas e sistema**. A área aparece também ao lado do título de cada ecrã.
- Cada área abre e fecha clicando no nome (o programa lembra-se).
- Todos os menus ficam ativos: sem dados, o ecrã explica o que faz e o que é preciso carregar, com botões para importar ou abrir uma análise guardada.

## 1.16.1 — correção

- A barra lateral passou a ter deslocamento próprio: em ecrãs mais baixos (portáteis) todos os menus ficam acessíveis rodando a roda do rato sobre a barra; o logótipo e o rodapé (espaço, operador, sair) ficam sempre visíveis.

## Painel do gabinete, calendário, fluxos de caixa, pagamentos por conta e pacote trimestral — novo na versão 1.16

- **Painel do gabinete** (menu Comando): todas as empresas num ecrã — faturação em falta mês a mês, risco fiscal, clientes com mais de 90 dias, IES em falta, próxima obrigação e pendentes; filtros por responsável e setor; Excel.
- **Calendário de obrigações**: DP e pagamento do IVA (mensal/trimestral, pela ficha), e-fatura, remunerações, retenções e Segurança Social, Modelo 22, IES, inventário e pagamentos por conta; dias úteis com feriados nacionais; prazos anuais editáveis em Definições (prorrogações).
- **Duplicados**: aviso no Painel do gabinete e no Mapa de IVA quando o mesmo mês foi carregado duas vezes do mesmo programa, com botão para apagar o ficheiro a mais.
- **Contabilidade › Fluxos de caixa**: demonstração dos fluxos de caixa (método indireto) com verificação e caixa e bancos mês a mês.
- **Demonstrações & IRC › 6 · Imposto › Pagamentos por conta**: prestações, pagamento adicional por conta e indicação de limitação do 3.º pagamento (art. 107.º CIRC).
- **Contabilidade › Pacote do trimestre**: relatório premium para o cliente (sumário, resultados com o ano anterior, IVA, tesouraria, saldos e pontos de atenção).

## Antiguidade de saldos — novo na versão 1.15

- Contabilidade › separador **Antiguidade de saldos** (clientes 21 e fornecedores 22, a partir do SAF-T de contabilidade).
- Recebimentos e pagamentos abatem primeiro as faturas mais antigas (FIFO), ao dia; com o ano anterior carregado, identifica a origem dos saldos de abertura.
- Escalões 0–30, 31–60, 61–90, 91–180, 181–365 e mais de 1 ano; idade média; prazos médios reais comparados com o setor (Banco de Portugal); pontos de atenção.
- Imparidades de clientes (art. 28.º-B do CIRC) com exclusões e ligação ao passo 4 do IRC.
- Relatório para imprimir/PDF, Excel e cartas de circularização com talão de resposta.
- SAF-T de contabilidade carregados antes da 1.15 dão antiguidade aproximada ao mês: volte a carregá-los para ter a antiguidade ao dia.

## Guia & Como fazer — novo na versão 1.14

- Menu **Guia & Como fazer** (em baixo, depois de Definições): 18 capítulos e 48 tarefas explicadas clique a clique, com pesquisa e índice.
- Cada tarefa tem o botão **Ir para** que abre o ecrã certo (e o separador certo, quando existe).
- Em qualquer ecrã, o botão **Como fazer** ao lado do título abre o guia no capítulo desse ecrã.
- **Guia completo (PDF)**: capa, índice e todos os capítulos, pronto a imprimir ou guardar em PDF.

## Utilização rápida

| Separador | Para quê |
|---|---|
| **Importar SAF-T** | Um ficheiro (qualquer tamanho) ou **lote** de vários ficheiros (vários clientes ou meses) |
| **Painel** | Pontuação 0–100, estado (pronto / rever / bloqueado), indicadores, principais alertas, mapa de IVA |
| **Validação** | Mais de 30 regras: taxas inválidas, totais, numeração, ATCUD, Hash, NIF, isenções, consumidor final, classificador por descrição… |
| **Mapa IVA & DP** | Apuramento por região e taxa, campos 1–6 do Quadro 06, confronto com os valores declarados |
| **Correções** | Corrigir taxas linha a linha ou em massa, anular correções, exportar o SAF-T corrigido (verificado automaticamente) |
| **Documentos / Artigos / Clientes** | Exploração com filtros, ordenação e exportação para Excel |
| **Análises de gestão** | 7 separadores: Vendas (dia, hora, semana, acumulado, distribuição por valor, cesto médio, séries), Clientes (frequência, localidades, carteira ABC, dias sem comprar), Artigos & ABC (curva de Pareto), Preços & descontos (variações de preço, ofertas), Pagamentos & recebimentos (meios de pagamento, prazo médio de recebimento, faturas sem recibo), Documentos (conferência em aberto), Auditoria (operadores, Lei de Benford) |
| **Evolução & Comparativos** | Mês a mês e ano a ano (Δ mês anterior, Δ homólogo, acumulado do ano), gráfico ano contra ano anterior, comparar quaisquer períodos (artigos e clientes que sobem, descem, novos e perdidos; taxas; dias; horas; operadores), mapa de calor dia × hora, concentração e curva ABC, PDF de evolução |
| **Relatórios** | PDF de auditoria, mapa de IVA, registo de correções e relatório de vendas para o cliente |
| **Multi-empresa** | Uma linha por empresa, com o estado do mês de controlo e o mapa dos 12 meses do ano. Filtro "Sem análise" para ver o que falta fazer no mês. Ficha da empresa com todos os períodos e ligação à Evolução |
| **Definições** | A minha conta (alterar palavra-passe), dados do gabinete nos PDF, logótipo, taxas por região, limites, dicionário do classificador |
| **Contas da plataforma** | Só para a conta do gabinete: lista de contas criadas, suspender ou reativar |

**Importante:** o SAF-T corrigido serve só para importar na contabilidade (CentralGest). A assinatura (Hash) dos documentos alterados deixa de corresponder ao original, por isso este ficheiro **não deve ser submetido à AT**.

Sem configuração Firebase, o AuditNux abre em **modo local**: funciona tudo menos o histórico multi-empresa e a partilha de definições.

## Filtro de período (Empresa + Período)

O Mapa de IVA, as Análises de gestão, os Artigos, os Clientes e os Relatórios têm no topo uma barra com:
- **Empresa:** qualquer empresa com SAF-T já carregados;
- **De / Até:** qualquer intervalo de meses;
- botões rápidos: **Mês · Trimestre · Ano · Acumulado do ano · 12 meses · Tudo**.

Tudo o que aparece (indicadores, gráficos, tabelas, PDF e Excel) respeita esse período. A barra avisa quando há meses sem SAF-T no intervalo escolhido.

A **Validação**, as **Correções** e os **Documentos** (detalhe linha a linha) trabalham sempre sobre o **ficheiro aberto**.

## Financeiro (por período)

| Separador | O que faz |
|---|---|
| **Diário de vendas (SNC)** | Lançamento resumo por mês (clientes, vendas por mercado e natureza, IVA por taxa, notas de crédito, retenções), com verificação Débito = Crédito. Plano de contas editável (padrão do gabinete ou por empresa). Excel e PDF |
| **Conta corrente & antiguidade** | Saldos em aberto por cliente (faturas a crédito − recibos − notas de crédito), escalões 0–30 / 31–60 / 61–90 / 91–180 / >180 dias, prazo médio de recebimento. Excel e PDF |
| **Mercados & Recapitulativa** | Nacional / UE / fora da UE × mercadorias / serviços; pré-Declaração Recapitulativa por NIF (M16 bens, M40 serviços) |
| **IVA completo** | Quadro 06 por mês ou trimestre (regime por empresa): campos 1–9 e IVA das notas de crédito (campo 40); enquadramento de cada motivo de isenção |
| **Retenções** | Retenções na fonte sofridas por cliente |
| **Projeção do ano** | Estimativa de fecho do ano (sazonalidade do ano anterior e linear) |
| **Dossier anual** | PDF completo da empresa para o período escolhido |

Os meses carregados antes da versão 1.5 têm de ser carregados outra vez para entrarem no Financeiro.

## Contabilidade (SAF-T de contabilidade) — novo na versão 1.7

Lê o SAF-T de contabilidade exportado do CentralGest (anual ou do ano até à data). O Balanço, a DR, o IRC e a banca estão no menu **Demonstrações & IRC** (ver a secção seguinte).

**Como carregar (passo a passo)**

1. Menu **Importar SAF-T** → arraste o ficheiro de contabilidade (é o mesmo sítio dos ficheiros de faturação; o AuditNux reconhece o tipo sozinho).
2. Pode arrastar vários de uma vez (ex.: 2025 e 2026) na **Importação em lote**.
3. Abre o menu **Contabilidade**. Escolha a empresa, o exercício e o período (De / Até).

**Separadores**

| Separador | O que faz |
|---|---|
| **Resumo** | Vendas, rendimentos, gastos, resultado (estimativa 7 − 6), meios financeiros, clientes, fornecedores e Estado, com comparação com o ano anterior; gráficos por mês e por natureza; verificações de integridade. Avisa quando o CMVMC (61) ainda não está apurado |
| **Balancete** | Qualquer período, por classe, 2/3/4 dígitos, contas de movimento ou todos os níveis; pesquisa; comparação com o ano anterior; Excel e PDF. Clicar numa conta abre o razão |
| **Razão** | Extrato de uma conta (ou de um grupo, ex.: 2433) com saldo acumulado; clicar num movimento mostra o lançamento completo. Excel |
| **Clientes & Fornecedores** | Saldos por terceiro (também pessoal, Estado, financiamentos, sócios), saldos de natureza contrária, maiores volumes e concentração. Excel |
| **IVA** | Liquidado (2433), dedutível (2432), regularizações (2434) e resultado por mês, com indicação do apuramento registado |
| **Cruzamento com a faturação** | Vendas (71+72) e IVA da contabilidade contra os SAF-T de faturação da mesma empresa, mês a mês |
| **Risco fiscal** | Desde a 1.9 (por setor desde a 1.10): semáforo e até 9 indicadores (custos de produção / vendas, obras em curso face às vendas, fundos de sócios e outros credores, salários e Segurança Social em atraso, capital próprio — art. 35.º CSC, bancos com saldo credor, IVA a recuperar), evolução dos exercícios carregados e **PDF de risco fiscal** |
| **Auditoria** | 27 verificações (inclui F01/F02: regularizações e entradas a crédito de sócios ou outros credores): integridade do ficheiro, passagem de saldos entre anos, saldos de natureza contrária (caixa, bancos, clientes, fornecedores, inventários, ativos), IVA por apurar, possíveis faturas duplicadas, numerário ≥ 3 000 €, lançamentos fora do exercício ou tardios, NIF inválidos, Benford |

**Balancete em Excel**

O botão **Balancete Excel** exporta o balancete acumulado (contas de movimento, coluna "Saldo acumulado": positivo = devedor) para usar fora do AuditNux. Num ano fechado, em **Encerramento**, "Com regularizações de fim de ano" inclui o CMVMC e o imposto estimado do período 13, mas não o apuramento de resultados.

**O que fica guardado:** só o resumo (saldo de abertura e movimentos de cada conta por mês, IVA por mês e o resultado da auditoria) — cerca de 0,5 MB por empresa e ano. O ficheiro SAF-T não é guardado. O razão lançamento a lançamento só está disponível enquanto o ficheiro estiver aberto; depois disso vê-se o resumo por mês de cada conta.

**Apagar:** no menu Contabilidade, botão 🗑 (apaga o exercício escolhido). "Apagar todos os dados da empresa" (Multi-empresa) também apaga a contabilidade.

## Empresas (ficha de cada empresa) — novo na versão 1.10

Cada empresa tem uma ficha com **CAE, setor de atividade, normativo (NC-ME, NCRF-PE…), capital e o histórico das IES**. O setor sai do CAE e decide o que o **Risco fiscal** analisa e os textos que escreve (obras em curso numa construtora, uva e vinho numa adega, mercadorias e margem num comércio, custo das matérias na restauração…).

**Como se preenche (sem escrever nada):**
1. Menu **Empresas** → **Carregar IES (PDF)** → escolha as IES de todas as empresas de uma vez (Ctrl + A na pasta).
2. O AuditNux lê o NIF, o nome, o CAE, o normativo, a Demonstração dos Resultados e o Balanço, e confirma os totais com as fórmulas oficiais do impresso.
3. Empresas que só tenham SAF-T aparecem na lista com "Falta" no CAE: clique na empresa e escreva o CAE, ou escolha o setor diretamente no separador Risco fiscal.

**Desde a 1.11 a base de empresas é o ponto de partida:**
- Cada SAF-T carregado (faturação ou contabilidade) fica ligado à ficha; se a empresa não existir, é criada e o programa avisa. No cimo do ecrã aparece o CAE e o setor da empresa do ficheiro aberto (clique para abrir a ficha).
- **Multi-empresa** lista todas as empresas da base, mesmo sem análises ("por fazer"), com filtros por setor e por responsável, a coluna "Contab." (até que mês está carregada a contabilidade do ano) e a opção de incluir as cessadas.
- Campos da ficha: regime de IVA (preenchido sozinho a partir dos apuramentos da contabilidade), concelho da sede (preenchido a partir do serviço de finanças da IES), estado (ativa/cessada) e responsável no gabinete.

**Desde a 1.12 a ficha alimenta também:**
- **Demonstrações & IRC:** derrama do concelho (definida uma vez por concelho no menu Empresas › Derrama por concelho), PME sim/não, comparativo automático com a IES do ano anterior guardada na ficha (quando não há SAF-T desse ano), aviso do art. 35.º do CSC, rácios com o valor do setor ao lado e um parágrafo de enquadramento setorial no parecer.
- **Validação da faturação:** regras do setor — construção (S01 IVA liquidado a empresas / autoliquidação, S02 faturas sem IVA a particulares, S03 linhas a 6%, S04 faturas redondas a particulares), restauração (S05 sem vendas a 23%), comércio por grosso (S06 vendas a particulares), serviços e transportes (S07 linhas a 13%).
- **Mapa de IVA:** cartão com CAE, setor e regime de IVA; aviso se a empresa é trimestral e o período escolhido não é um trimestre completo.
- **Comparação com o setor** (ficha, Risco fiscal, Demonstrações): autonomia financeira, liquidez geral, rendibilidades, rotação do ativo e prazos médios face aos valores do Banco de Portugal — Central de Balanços, 2024 (Sínteses Estatísticas Setoriais GEE/DGAE, janeiro de 2026).

**Novo na 1.13:**
- **Empresários em nome individual (NIF 1, 2 ou 3):** o SAF-T é lido e analisado normalmente, mas não cria ficha automaticamente (no cimo aparece "ENI · leitura simples"; clique se quiser criar a ficha).
- **Leitura rápida** (Importar SAF-T): lê, valida, mostra o mapa de IVA e imprime sem gravar nada — nem nuvem, nem Multi-empresa, nem ficha.
- **Tabela fiscal por ano** (Definições): taxas de IRC por exercício (2024 21%/17%, 2025 20%/16%, 2026 19%/15%) usadas automaticamente nas Demonstrações & IRC conforme o ano; períodos de IVA com taxas diferentes, se a lei mudar a meio do ano.
- **Ficha da empresa:** botões "Carregar SAF-T" (avisa se o ficheiro for de outra entidade) e "Relatório executivo" (também no Risco fiscal): capa, sumário com pontos a acompanhar, evolução das IES com gráfico, balanço resumido (sempre equilibrado), comparação com o setor e risco fiscal — abre numa janela própria; Imprimir › Guardar como PDF.
- **Derrama municipal oficial:** os 308 municípios do Ofício-Circulado n.º 20288, de 02/02/2026 (taxas sobre o lucro tributável de 2025) estão dentro do programa. Cada empresa recebe sozinha a taxa geral, a taxa reduzida ou a isenção, conforme o concelho da ficha e o volume de negócios do período anterior (IES). Reduções e isenções com outras condições (emprego, setor, NIF) são assinaladas para confirmar. A "Taxa manual" no menu Empresas só serve para substituir a tabela oficial.
- **Relatório executivo com demonstrações completas:** Demonstração dos resultados por naturezas e Balanço no modelo da IES (Anexo A, quadros 03-A e 04-A), até 5 anos, com verificação Ativo = Capital próprio + Passivo.
- **Leitura da IES corrigida:** cada valor passa a ser atribuído à rubrica certa também quando há linhas em branco (conferidas 541 rubricas de 10 IES contra um leitor independente). Volte a carregar as IES depois de atualizar.
- Para a assinatura dos relatórios: Definições › Responsável e Título profissional (ex.: "Contabilista Certificado — Inscrito na OCC 46003").

Setores: Construção · Indústria das bebidas (vinhos) · Indústria transformadora · Comércio por grosso · Comércio a retalho · Alojamento e restauração · Transportes · Agricultura · Atividades imobiliárias · Serviços. O setor pode ser mudado à mão na ficha (fica marcado como "manual").

## Demonstrações & IRC (o antigo Motor de Apuramento) — novo na versão 1.8

O Motor de Apuramento passou para dentro do AuditNux, com os mesmos cálculos (testados lado a lado: resultado, lucro tributável, prejuízos, matéria coletável, IRC, derramas, tributações autónomas e resultado líquido dão exatamente os mesmos valores).

**Passo a passo**

1. Menu **Demonstrações & IRC** → separador **1 · Balancete**.
2. Escolha a fonte:
   - **SAF-T de contabilidade** (recomendado): empresa, exercício e mês "Até" → **Usar este balancete**. O comparativo com o ano anterior entra sozinho se o SAF-T desse ano estiver carregado. Também pode vir do menu Contabilidade, botão **Demonstrações & IRC**.
   - **Balancete em Excel**: para empresas sem SAF-T. As colunas são detetadas sozinhas e podem ser corrigidas.
3. **2 · Existências**: existência final de mercadorias/matérias-primas e de produção, e amortizações do período (só se o ano ainda não estiver fechado).
4. **3 · Parâmetros fiscais** e **4 · Correções & prejuízos**: como no Motor.
5. **5 · Demonstrações**: Demonstração dos resultados por naturezas e **Balanço** (modelo SNC), com a coluna do ano anterior. O Balanço fecha sempre; se os valores indicados à mão não baterem com o balancete, a diferença aparece identificada no capital próprio como "Ajustamentos de encerramento pendentes".
6. **6 · Imposto**, **7 · Rácios & banca** e **8 · Parecer**.
7. **Relatório PDF**: relatório económico-financeiro completo (DR, Balanço, IRC, prejuízos, comparativo, rácios, banca, parecer e assinatura).
8. **Guardar** guarda a análise na nuvem da conta (com login), **Análises** abre as guardadas.

**Diferenças em relação ao Motor antigo (melhorias)**

- O Balanço e a DR seguem o modelo SNC (o Motor só tinha um resumo). Os rácios passam a usar o Balanço com corrente / não corrente e com as existências finais, amortizações e imposto indicados.
- O ROE não é calculado com capital próprio negativo.
- O comparativo do ano anterior a partir do SAF-T dá a DR e o Balanço completos do ano anterior.

**Trazer as análises do Motor antigo**

Em **Análises** → **Importar do Motor antigo**: escolha os ficheiros .json exportados no Motor, ou cole a chave da base de dados antiga (está no apuramento.html antigo, linha 13, a seguir a FB_SECRET) e clique em **Importar tudo**. O Motor antigo não gravava as amortizações indicadas à mão: confirme o passo 2 ao abrir uma análise importada.

## Vários SAF-T no mesmo mês

Uma empresa pode ter mais do que um SAF-T por mês (por exemplo, duas lojas ou bases do mesmo programa e o SAF-T do PagAqui). Cada ficheiro é guardado como uma **fonte** (programa + séries). O mês passa a ser **a soma das fontes** em todo o lado: Multi-empresa, Mapa de IVA, Análises, Evolução e Financeiro. Na ficha da empresa vê-se cada ficheiro separadamente.

## Voltar a carregar e apagar análises

- **Voltar a carregar um SAF-T do mesmo período substitui a análise anterior.** Não fica duplicada e não é preciso apagar primeiro.
- **Um ficheiro que só cobre parte de um mês** (ex.: 25/01 a 28/02) fica como "período parcial" e **nunca substitui** um mês completo já guardado.
- **Apagar:** na ficha da empresa (Multi-empresa → clicar na empresa), cada período tem um caixote 🗑. O botão **Apagar todos os dados da empresa** pede o NIF para confirmar. Os ficheiros SAF-T originais nunca são afetados.

## Histórico mensal (Evolução)

Cada SAF-T importado gera automaticamente um **resumo de gestão por mês**: vendas por dia, hora e taxa, os 300 artigos e os 200 clientes principais, e os operadores. O resumo fica guardado no espaço da conta. Um SAF-T anual é dividido sozinho nos 12 meses.

Assim, os comparativos aparecem logo, sem voltar a carregar ficheiros antigos. Para começar com histórico, importe em lote os SAF-T dos últimos 12 a 24 meses de cada cliente (separador Importar, quadro **Importação em lote**).

© Rui Gonçalves — AuditNux v1.6.0
