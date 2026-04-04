# Guia de Deploy - Servidor CasaOS

## Visão Geral

O Converte roda como container Docker usando `@sveltejs/adapter-node` (servidor Node.js).
O banco de dados é SQLite e fica persistido em um volume Docker.

## Pré-requisitos

- Servidor com CasaOS (Docker + Docker Compose)
- Acesso SSH ou console ao servidor

## Deploy

### 1. Clonar o repositório no servidor

```bash
cd /var/lib/casaos/Apps/  # ou o diretório preferido do CasaOS
git clone <URL_DO_REPOSITORIO> converte
cd converte
```

### 2. Subir o container

```bash
docker compose up -d --build
```

### 3. Acessar

O app estará disponível em:

```
http://192.168.15.42:3000
```

### 4. Nome amigável na rede local (mDNS)

CasaOS já roda **Avahi/mDNS** por padrão, então o app também responde pelo nome do servidor:

```
http://converte-pei.local:3000
```

Se não funcionar, no SSH do servidor instale e ative o Avahi:

```bash
sudo apt install avahi-daemon -y
sudo systemctl enable --now avahi-daemon
```

Isso é só um "apelido" para o mesmo endereço — não altera o IP nem conflita com nada.
As duas URLs apontam pro mesmo lugar:

```
http://192.168.15.42:3000       ← mesma coisa
http://converte-pei.local:3000  ← mesmo lugar, nome mais bonito
```

## Portas

| Serviço   | Porta |
|-----------|-------|
| Converte  | 3000  |

Se precisar usar outra porta, edite o `docker-compose.yml`:

```yaml
ports:
  - "OUTRA:3000"
```

## Persistência (Banco de Dados)

O SQLite usa o volume `converte-db`, mapeado para `/app/data` dentro do container.
O arquivo do banco fica em `/var/lib/docker/volumes/converte_converte-db/_data/banco_local_pei.db`.

## Integração com n8n

Se o n8n também roda no mesmo servidor via Docker:

- **Do n8n para o Converte:** `http://converte:3000/api/respostas` (mesma rede Docker) ou `http://host.docker.internal:3000/api/respostas`
- **Do Converte para o n8n:** `http://n8n:5678` (mesma rede Docker) ou `http://host.docker.internal:5678`

Se o n8n **não** estiver no Docker, usar o IP da rede local do servidor:

```
http://192.168.x.x:5678  (substitua pelo IP real)
```

## Adicionar via CasaOS (opcional)

No painel do CasaOS, clique em **+ Add Application** → **Custom Install**:

- **Name:** Converte
- **Image:** (deixe em branco)
- **Container name:** converte
- **Ports:** `3000:3000`

Aponte para o `docker-compose.yml` no diretório do projeto.

## Manutenção

### Ver logs

```bash
docker compose logs -f converte
```

### Atualizar

```bash
git pull
docker compose up -d --build
```

### Parar

```bash
docker compose down
```

O volume do banco de dados **não** é removido com `docker compose down`. Para remover tudo (perde os dados):

```bash
docker compose down -v
```
