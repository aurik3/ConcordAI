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