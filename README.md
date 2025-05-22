# AI Agents Collaboration Network

Una librería TypeScript para crear y conectar agentes de inteligencia artificial en una red colaborativa, permitiendo la comunicación y colaboración entre múltiples agentes especializados.

## 🚀 Características

- 🔄 Comunicación en tiempo real entre agentes
- 🔒 Sistema de autenticación y encriptación
- 📡 Transporte WebSocket para comunicación bidireccional
- 🤖 Soporte para múltiples tipos de agentes
- 📝 Sistema de mensajería asíncrono
- 🌐 Broadcast de mensajes a toda la red
- 📊 Gestión de capacidades y estados de agentes
- 🛡️ Tipado fuerte con TypeScript

## 📦 Instalación

```bash
npm install ai-agents-collaboration
```

## 🔧 Requisitos

- Node.js >= 14.x
- TypeScript >= 4.x
- Dependencias principales:
  - ws
  - jsonwebtoken
  - crypto-js
  - dotenv
  - winston

## 🎯 Uso Básico

### 1. Configuración Inicial

```typescript
import { WebSocketTransport } from 'ai-agents-collaboration/transport';
import { Encryption } from 'ai-agents-collaboration/utils/encryption';
import { Authentication } from 'ai-agents-collaboration/utils/auth';
import { Agent, AgentStatus, AgentCapability } from 'ai-agents-collaboration/types';

// Configuración de seguridad
const encryption = new Encryption('tu-clave-encryption');
const auth = new Authentication('tu-clave-auth');
const transport = new WebSocketTransport(0, 'tu-clave-encryption', 'tu-clave-auth');

// Iniciar el servidor
await transport.listen();
```

### 2. Crear un Agente

```typescript
const miAgente: Agent = {
    id: 'mi-agente-unico',
    name: 'Mi Agente Especializado',
    capabilities: [
        AgentCapability.TEXT_PROCESSING,
        AgentCapability.DATA_ANALYSIS,
        AgentCapability.COLLABORATION
    ],
    metadata: { 
        version: '1.0',
        model: 'GPT-4',
        specializations: ['tu especialización']
    },
    status: AgentStatus.ONLINE
};

// Registrar el agente
const token = auth.generateToken(miAgente);
await transport.registerAgent(miAgente, token);
```

### 3. Enviar y Recibir Mensajes

```typescript
// Enviar un mensaje broadcast
const mensaje: Message = {
    id: 'msg-1',
    senderId: miAgente.id,
    receiverId: 'all',
    type: MessageType.BROADCAST,
    content: {
        action: 'procesar_tarea',
        data: {
            descripcion: 'Descripción de la tarea',
            requisitos: ['requisito1', 'requisito2']
        }
    },
    timestamp: Date.now(),
    priority: MessagePriority.HIGH,
    encryption: true
};

await transport.broadcast(mensaje);

// Escuchar mensajes
transport.on('message', async (message: Message) => {
    switch (message.type) {
        case MessageType.TASK_COMPLETION:
            console.log('✅ Tarea completada:', message.content);
            break;
        case MessageType.ERROR:
            console.error('❌ Error:', message.content.error);
            break;
    }
});
```

## 🔐 Configuración de Seguridad

### Variables de Entorno

Crea un archivo `.env` en la raíz de tu proyecto:

```env
ENCRYPTION_KEY=tu-clave-encryption-secreta
AUTH_KEY=tu-clave-auth-secreta
```

### Generación de Claves

```typescript
const auth = new Authentication();
const encryptionKey = auth.generateSecretKey();
const authKey = auth.generateSecretKey();
```

## 📚 Tipos de Mensajes

- `REQUEST`: Solicitud directa a un agente
- `RESPONSE`: Respuesta a una solicitud
- `BROADCAST`: Mensaje para todos los agentes
- `TASK_COMPLETION`: Notificación de tarea completada
- `ERROR`: Mensaje de error
- `STATUS_UPDATE`: Actualización de estado
- `COLLABORATION_REQUEST`: Solicitud de colaboración

## 🔄 Manejo de Reconexiones

```typescript
transport.on('disconnect', async () => {
    console.log('🔄 Reconectando...');
    await new Promise(resolve => setTimeout(resolve, 5000));
    await transport.listen();
    await transport.registerAgent(miAgente, token);
});
```

## 📊 Monitoreo y Logging

La librería utiliza Winston para el logging. Los logs se guardan en:
- `error.log`: Errores
- `combined.log`: Todos los logs

## 🧪 Ejemplos

La librería incluye varios ejemplos en el directorio `examples/`:

- `basic-usage.ts`: Uso básico de la librería
- `ai-collaboration.ts`: Ejemplo de colaboración entre agentes
- `story-collaboration.ts`: Ejemplo de creación colaborativa de historias

Para ejecutar los ejemplos:

```bash
npm run example
npm run example:ai
npm run example:story
```
## 🌐 Configuración de Red Distribuida

Esta sección explica cómo configurar una red de agentes distribuida, permitiendo que agentes en diferentes redes se comuniquen entre sí.

### 1. Configuración del Servidor Central (Network Hub)

El servidor central actúa como punto de conexión para todos los agentes. Debe estar accesible desde internet.

```typescript
// server.ts
import { WebSocketTransport } from 'ai-agents-collaboration/transport';
import { Encryption } from 'ai-agents-collaboration/utils/encryption';
import { Authentication } from 'ai-agents-collaboration/utils/auth';
import { config } from 'dotenv';

config();

async function iniciarServidor() {
    try {
        // Configuración del servidor
        const encryption = new Encryption(process.env.ENCRYPTION_KEY || 'clave-encryption-secreta');
        const auth = new Authentication(process.env.AUTH_KEY || 'clave-auth-secreta');
        
        // El puerto 8080 debe estar abierto en el firewall y configurado en el router
        const transport = new WebSocketTransport(8080, process.env.ENCRYPTION_KEY || 'clave-encryption-secreta', process.env.AUTH_KEY || 'clave-auth-secreta');
        
        // Iniciar el servidor
        await transport.listen();
        
        const port = transport.getPort();
        console.log(`
🚀 Servidor de Red de Agentes iniciado
------------------------------------
📡 Puerto: ${port}
🔒 Encriptación: Activada
🔑 Autenticación: Activada
🌐 URL de conexión: ws://tu-ip-publica:${port}
        `);

        // Manejar conexiones de agentes
        transport.on('connection', (agentId) => {
            console.log(`\n📥 Nuevo agente conectado: ${agentId}`);
        });

        // Manejar desconexiones
        transport.on('disconnection', (agentId) => {
            console.log(`\n📤 Agente desconectado: ${agentId}`);
        });

    } catch (error) {
        console.error('❌ Error al iniciar el servidor:', error);
        process.exit(1);
    }
}

iniciarServidor();
```

### 2. Configuración del Agente Remoto (Cliente)

Los agentes remotos se conectan al servidor central desde cualquier ubicación en internet.

```typescript
// remote-agent.ts
import { WebSocketTransport } from 'ai-agents-collaboration/transport';
import { Encryption } from 'ai-agents-collaboration/utils/encryption';
import { Authentication } from 'ai-agents-collaboration/utils/auth';
import { Agent, AgentStatus, AgentCapability, MessageType, MessagePriority, Message } from 'ai-agents-collaboration/types';
import { config } from 'dotenv';

config();

class AgenteRemoto {
    private transport: WebSocketTransport;
    private agent: Agent;
    private token: string;

    constructor() {
        // Configuración del cliente
        const encryption = new Encryption(process.env.ENCRYPTION_KEY || 'clave-encryption-secreta');
        const auth = new Authentication(process.env.AUTH_KEY || 'clave-auth-secreta');
        
        // Crear el agente
        this.agent = {
            id: 'agente-remoto-1',
            name: 'Agente Remoto Especializado',
            capabilities: [
                AgentCapability.TEXT_PROCESSING,
                AgentCapability.DATA_ANALYSIS,
                AgentCapability.COLLABORATION
            ],
            metadata: { 
                version: '1.0',
                model: 'GPT-4',
                specializations: ['análisis de datos', 'procesamiento de texto']
            },
            status: AgentStatus.OFFLINE
        };

        // Configurar el transporte para conectarse al servidor remoto
        this.transport = new WebSocketTransport(
            0, // Puerto local (se asignará automáticamente)
            process.env.ENCRYPTION_KEY || 'clave-encryption-secreta',
            process.env.AUTH_KEY || 'clave-auth-secreta'
        );

        // Generar token de autenticación
        this.token = auth.generateToken(this.agent);
    }

    async conectar() {
        try {
            console.log('\n🔄 Conectando al servidor de red...');
            
            // Conectar al servidor remoto
            await this.transport.connect(`ws://tu-ip-publica:8080`);
            
            // Registrar el agente
            await this.transport.registerAgent(this.agent, this.token);
            
            console.log('✅ Agente registrado exitosamente');

            // Configurar manejadores de eventos
            this.configurarManejadores();

        } catch (error) {
            console.error('❌ Error al conectar:', error);
            throw error;
        }
    }

    // ... resto de la implementación del agente ...
}
```

### 3. Configuración de Red

#### En el Servidor:

1. **Firewall:**
   - Abre el puerto 8080 (o el que hayas elegido) en el firewall
   - Asegúrate de que el tráfico entrante esté permitido

2. **Router:**
   - Configura el port forwarding:
     ```
     Puerto Externo: 8080 -> Puerto Interno: 8080
     IP Interna: [IP-local-del-servidor]
     ```

3. **Variables de Entorno:**
   ```env
   # .env en el servidor
   ENCRYPTION_KEY=tu-clave-encryption-secreta
   AUTH_KEY=tu-clave-auth-secreta
   ```

#### En los Agentes Remotos:

1. **Variables de Entorno:**
   ```env
   # .env en los agentes remotos
   ENCRYPTION_KEY=tu-clave-encryption-secreta
   AUTH_KEY=tu-clave-auth-secreta
   SERVER_URL=ws://tu-ip-publica:8080
   ```

2. **Conexión:**
   - Asegúrate de que el agente pueda acceder al puerto 8080 del servidor
   - Verifica que la URL del servidor sea correcta

### 4. Ejecución

1. **Iniciar el Servidor:**
   ```bash
   # En la máquina servidor
   npm run start:server
   ```

2. **Iniciar Agentes Remotos:**
   ```bash
   # En las máquinas cliente
   npm run start:agent
   ```

### 5. Verificación

#### Servidor:
```
🚀 Servidor de Red de Agentes iniciado
------------------------------------
📡 Puerto: 8080
🔒 Encriptación: Activada
🔑 Autenticación: Activada
🌐 URL de conexión: ws://tu-ip-publica:8080
```

#### Agente Remoto:
```
🔄 Conectando al servidor de red...
✅ Agente registrado exitosamente
```

#### Servidor (cuando se conecta un agente):
```
📥 Nuevo agente conectado: agente-remoto-1
```

### 6. Consideraciones de Seguridad

1. **Encriptación:**
   - Usa claves de encriptación fuertes
   - Cambia las claves regularmente
   - No compartas las claves en repositorios públicos

2. **Autenticación:**
   - Implementa un sistema de tokens robusto
   - Valida las credenciales de los agentes
   - Limita el acceso a agentes autorizados

3. **Firewall:**
   - Limita el acceso solo a los puertos necesarios
   - Implementa reglas de firewall estrictas
   - Monitorea el tráfico de red

4. **SSL/TLS:**
   - Considera usar WSS (WebSocket Secure) para conexiones encriptadas
   - Configura certificados SSL válidos
   - Mantén los certificados actualizados

### 7. Solución de Problemas

1. **Conexión Rechazada:**
   - Verifica que el puerto esté abierto en el firewall
   - Confirma que el port forwarding esté configurado correctamente
   - Asegúrate de que la IP pública sea accesible

2. **Errores de Autenticación:**
   - Verifica que las claves de encriptación coincidan
   - Confirma que los tokens sean válidos
   - Revisa los logs de autenticación

3. **Problemas de Red:**
   - Verifica la conectividad de red
   - Comprueba la latencia
   - Monitorea el uso de ancho de banda 

## 🤝 Contribuir

Las contribuciones son bienvenidas. Por favor:

1. Haz fork del repositorio
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para más detalles.

## 📞 Soporte

Si encuentras algún problema o tienes alguna pregunta, por favor:

1. Revisa la [documentación](docs/)
2. Abre un [issue](https://github.com/tu-usuario/ai-agents-collaboration/issues)
3. Contacta al equipo de soporte

## 🙏 Agradecimientos

- OpenAI por GPT-4
- La comunidad de TypeScript
- Todos los contribuidores 