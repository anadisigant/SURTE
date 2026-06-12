## Mapeamento do Fluxo Operacional

O ciclo de vida operacional do sistema SURTE está estruturado em 5 etapas macro, focando na eficiência da gestão do banco de fontes e na viabilização estável do agendamento de entrevistas. A documentação visual deste fluxo encontra-se mapeada no arquivo `docs/processo_surte.png`.

1. **Autenticação e Controle de Acesso**
O fluxo inicia-se com a autenticação do utilizador no sistema através do endpoint gerenciado em `app/api` e configurado por `app/core/security.py`. A aplicação valida as credenciais e o nível de permissão (Cargo) para conceder acesso aos módulos de visualização, edição ou administração.
2. **Gestão do Banco de Fontes (Entrevistados)**
Utilizadores autorizados populam e atualizam a base de contatos. Esta etapa envolve o cadastro de dados pessoais, áreas de especialização, histórico de comunicações e participações. Serve como o motor principal de busca indexada utilizado por jornalistas e produtores.
3. **Gestão de Programas e Pautas**
Módulo dedicado à criação e manutenção dos programas, quadros ou veículos de conteúdo para os quais as entrevistas serão direcionadas, garantindo o correto vínculo contextual da informação.
4. **Processo de Agendamento**
A etapa central do sistema. O produtor seleciona um entrevistado ativo do banco de fontes, vincula-o a um programa específico e define os parâmetros de data e horário através da camada de `app/routers`, alterando o estado da entidade Entrevista para o status `agendada`.
5. **Execução e Atualização de Histórico**
Após a ocorrência da data prevista, o status da entrevista é atualizado para `realizada` ou `cancelada`. Este registro é consolidado no histórico definitivo do entrevistado e do programa, gerando métricas agregadas de participação e acionando bloqueios de integridade no banco de dados.

---

## Identificação das Regras de Negócio (RNs)

Para garantir a integridade da aplicação, consistência dos dados e segurança da operação, foram definidas as seguintes Regras de Negócio, distribuídas entre as camadas de validação lógica (`app/schemas` e `app/services`) e validação física (`app/db/scripts/script-create.sql`):

| Código | Regra de Negócio | Descrição Técnica | Camada de Validação |
| --- | --- | --- | --- |
| **RN01** | Unicidade de Credenciais | O e-mail de utilizadores internos (equipe) e de entrevistados (fontes) deve ser estritamente único em toda a base de dados. | `app/schemas` (Pydantic) e Restrição `UNIQUE` no banco de dados. |
| **RN02** | Prevenção de Conflitos | Um mesmo entrevistado não pode ser vinculado a duas entrevistas concorrentes com o status `agendada` que possuam sobreposição de datas e horários. | `app/services` através de verificação de intervalos de tempo. |
| **RN03** | Preservação de Histórico | Programas e entrevistados vinculados a pelo menos uma entrevista histórica não podem ser eliminados fisicamente da base de dados. Utiliza-se inativação lógica (`ativo = false`). | `app/models` e cláusula `ON DELETE RESTRICT` nas chaves estrangeiras. |
| **RN04** | Transição de Status | Uma entrevista inicia obrigatoriamente como `agendada`. Só pode transicionar para os estados finais `realizada` ou `cancelada`. É vedado o retorno a estados anteriores. | `app/services` utilizando validação de máquinas de estado / Tipos `ENUM`. |
| **RN05** | Controle de Acesso (RBAC) | **Admin/Produtor:** Permissão integral de escrita (cadastros, criação de programas e agendamentos). <br>

<br>**Jornalista:** Acesso padrão de leitura e busca avançada no banco de fontes. | `app/api` através de injeção de dependências de segurança. |

---

## Estrutura de Artefatos e Modelagem de Dados

Os artefatos técnicos foram segregados para garantir um ambiente modular, limpo e preparado para futuras migrações automatizadas (Alembic):

### Scripts de Banco de Dados (SQL)

Localizados no diretório `app/db/scripts/`:

* `script-create.sql`: Contém as instruções DDL para a criação da estrutura de tabelas, tipos de dados customizados (`ENUMs` do PostgreSQL) e aplicação das restrições de integridade referencial.
* `script-insert.sql`: Provê a carga de dados inicial (*seeds*) necessária para simular o ambiente de produção com perfis e agendamentos de teste.
* `script-consultas.sql`: Reúne as principais queries DML de validação operacional, geração de relatórios e auditoria.

### Diagramas e Modelagem Visual

Localizados no diretório `docs/`:

* **Modelo Entidade-Relacionamento (MER):** Disponibilizado em formato bruto estruturado (`mer-surt.xml`), formato nativo de modelagem (`mer-surt.brM3`) e exportado para leitura direta em imagem (`mer-surt.png`).
![Modelo Entidade-Relacionamento do Banco de Dados SURTE](/docs/mer-surt.png)
* **Mapeamento de Processos:** Fluxograma de processos operacionais salvo no padrão de mercado BPMN (`processo_surte.bpmn`) e exportado em formato rasterizado (`processo_surte.png`).
  
![Fluxograma do Processo Operacional SURTE](/docs/processo_surte.png)
