# Guia de Setup Inicial — Fase 02

> **Objetivo**: Preparar infraestrutura e scaffolds para Fase 02  
> **Tempo Estimado**: 4-6 horas  
> **Status**: READY TO EXECUTE

---

## 🚀 Quick Start Checklist

- [ ] E1: Create compendium-service structure
- [ ] E2: Create shared-ui package
- [ ] E3: Configure dependencies & workspaces
- [ ] E4: Setup testing infrastructure
- [ ] E5: Create documentation structure
- [ ] E6: Verify everything builds

---

## E1: Create Compendium Service

### Step 1.1: Create base structure

```bash
cd /workspaces/vtt_tormenta

# Copy template from existing service
cp -r apps/vtt-engine-service apps/compendium-service

# Update base files
cd apps/compendium-service
rm -rf src test dist node_modules
mkdir -p src/{domain,application,infrastructure,config} test/unit
```

### Step 1.2: Update package.json

```bash
cat > package.json << 'EOF'
{
  "name": "@vtt/compendium-service",
  "version": "0.0.1",
  "private": true,
  "scripts": {
    "build": "nest build",
    "dev": "nest start --watch",
    "start": "node dist/main",
    "test": "jest",
    "test:coverage": "jest --coverage",
    "typecheck": "tsc --noEmit",
    "lint": "eslint src --ext .ts",
    "clean": "rm -rf dist"
  },
  "dependencies": {
    "@nestjs/common": "^10.3.0",
    "@nestjs/core": "^10.3.0",
    "@nestjs/config": "^3.2.0",
    "@nestjs/mongoose": "^10.0.6",
    "@nestjs/platform-fastify": "^10.3.0",
    "@nestjs/swagger": "^7.3.0",
    "@vtt/shared-config": "workspace:*",
    "@vtt/shared-types": "workspace:*",
    "@vtt/shared-utils": "workspace:*",
    "class-transformer": "^0.5.1",
    "class-validator": "^0.14.1",
    "mongoose": "^8.3.4",
    "reflect-metadata": "^0.2.2",
    "rxjs": "^7.8.1",
    "zod": "^3.23.0"
  },
  "devDependencies": {
    "@nestjs/cli": "^10.3.2",
    "@nestjs/testing": "^10.3.0",
    "@types/jest": "^29.5.12",
    "@types/node": "^20.12.7",
    "jest": "^29.7.0",
    "ts-jest": "^29.1.2",
    "typescript": "^5.4.5"
  }
}
EOF
```

### Step 1.3: Create main.ts

```bash
cat > src/main.ts << 'EOF'
import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { CompendiumModule } from './compendium.module';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    CompendiumModule,
    new FastifyAdapter(),
  );

  const config = new DocumentBuilder()
    .setTitle('Compendium Service')
    .setDescription('Game content API (races, classes, spells, etc)')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  const port = process.env.COMPENDIUM_PORT || 3040;
  await app.listen(port, '0.0.0.0');
  console.log(`Compendium service running on port ${port}`);
}

bootstrap();
EOF
```

### Step 1.4: Create module structure

```bash
# Domain entities
mkdir -p src/domain/{entry,category,tag}

cat > src/domain/entry/entry.entity.ts << 'EOF'
import { generateId } from '@vtt/shared-utils';

export enum EntryType {
  RACE = 'race',
  CLASS = 'class',
  ORIGIN = 'origin',
  POWER = 'power',
  SPELL = 'spell',
  MONSTER = 'monster',
  ITEM = 'item',
  CONDITION = 'condition',
}

export interface Entry {
  id: string;
  name: string;
  description: string;
  type: EntryType;
  system: 'tormenta20' | 'dnd5e' | 'shadowrun';
  tags: string[];
  isOfficial: boolean;
  isHomebrew: boolean;
  createdBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

export class EntryAggregate implements Entry {
  id: string;
  name: string;
  description: string;
  type: EntryType;
  system: 'tormenta20' | 'dnd5e' | 'shadowrun';
  tags: string[];
  isOfficial: boolean;
  isHomebrew: boolean;
  createdBy?: string;
  createdAt: Date;
  updatedAt: Date;

  constructor(props: Omit<Entry, 'id' | 'createdAt' | 'updatedAt'>) {
    this.id = generateId();
    this.createdAt = new Date();
    this.updatedAt = new Date();
    Object.assign(this, props);
  }

  static create(props: Omit<Entry, 'id' | 'createdAt' | 'updatedAt'>): EntryAggregate {
    return new EntryAggregate(props);
  }
}
EOF

# Application use cases
mkdir -p src/application

cat > src/application/list-entries.use-case.ts << 'EOF'
import { Injectable } from '@nestjs/common';

export interface ListEntriesRequest {
  type?: string;
  system?: string;
  skip?: number;
  limit?: number;
}

@Injectable()
export class ListEntriesUseCase {
  execute(request: ListEntriesRequest) {
    // TODO: Implement
    return { entries: [], total: 0 };
  }
}
EOF

# Infrastructure
mkdir -p src/infrastructure/{mongoose,http}

cat > src/infrastructure/http/compendium.controller.ts << 'EOF'
import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ListEntriesUseCase } from 'src/application/list-entries.use-case';

@ApiTags('Compendium')
@Controller('entries')
export class CompendiumController {
  constructor(private listEntries: ListEntriesUseCase) {}

  @Get()
  async list(@Query() query: any) {
    return this.listEntries.execute(query);
  }
}
EOF

# Health check
mkdir -p src/health

cat > src/health/health.controller.ts << 'EOF'
import { Controller, Get } from '@nestjs/common';

@Controller('health')
export class HealthController {
  @Get()
  check() {
    return { status: 'ok', service: 'compendium' };
  }
}
EOF
```

### Step 1.5: Create compendium.module.ts

```bash
cat > src/compendium.module.ts << 'EOF'
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { CompendiumController } from './infrastructure/http/compendium.controller';
import { HealthController } from './health/health.controller';
import { ListEntriesUseCase } from './application/list-entries.use-case';

@Module({
  imports: [
    ConfigModule.forRoot({ envFilePath: '.env.local' }),
    MongooseModule.forRoot(process.env.MONGODB_URI || 'mongodb://localhost:27017/vtt'),
  ],
  controllers: [CompendiumController, HealthController],
  providers: [ListEntriesUseCase],
})
export class CompendiumModule {}
EOF
```

---

## E2: Create Shared UI Package

### Step 2.1: Create structure

```bash
cd /workspaces/vtt_tormenta
mkdir -p packages/shared-ui/src/{components,hooks,styles}
mkdir -p packages/shared-ui/test
```

### Step 2.2: Create package.json

```bash
cat > packages/shared-ui/package.json << 'EOF'
{
  "name": "@vtt/shared-ui",
  "version": "0.0.1",
  "private": true,
  "scripts": {
    "build": "tsc",
    "dev": "tsc --watch",
    "test": "jest",
    "test:coverage": "jest --coverage",
    "storybook": "storybook dev -p 6006",
    "storybook:build": "storybook build",
    "typecheck": "tsc --noEmit",
    "lint": "eslint src --ext .ts,.tsx"
  },
  "exports": {
    ".": {
      "import": "./dist/index.js",
      "require": "./dist/index.js"
    },
    "./components": {
      "import": "./dist/components/index.js"
    },
    "./hooks": {
      "import": "./dist/hooks/index.js"
    },
    "./styles": {
      "import": "./dist/styles/index.js"
    }
  },
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "clsx": "^2.1.1",
    "tailwind-merge": "^2.3.0"
  },
  "devDependencies": {
    "@storybook/react": "^8.0.0",
    "@testing-library/react": "^16.0.0",
    "@types/jest": "^29.5.12",
    "@types/node": "^20.12.7",
    "@types/react": "^18.3.3",
    "jest": "^29.7.0",
    "ts-jest": "^29.1.4",
    "typescript": "^5.4.5"
  },
  "peerDependencies": {
    "react": "^18.0.0",
    "react-dom": "^18.0.0"
  }
}
EOF
```

### Step 2.3: Create tsconfig.json

```bash
cat > packages/shared-ui/tsconfig.json << 'EOF'
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "lib": ["ES2020", "DOM"],
    "jsx": "react-jsx"
  },
  "include": ["src"],
  "exclude": ["node_modules", "dist"]
}
EOF
```

### Step 2.4: Create initial components

```bash
mkdir -p packages/shared-ui/src/components/{Button,Input,Card}

cat > packages/shared-ui/src/components/Button/Button.tsx << 'EOF'
import { ButtonHTMLAttributes } from 'react';
import { clsx } from 'clsx';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
}

export function Button({
  variant = 'primary',
  size = 'md',
  className,
  ...props
}: ButtonProps) {
  const baseStyles = 'font-medium rounded transition-colors';
  const variantStyles = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white',
    secondary: 'bg-gray-600 hover:bg-gray-700 text-white',
    danger: 'bg-red-600 hover:bg-red-700 text-white',
  };
  const sizeStyles = {
    sm: 'px-2 py-1 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  return (
    <button
      className={clsx(baseStyles, variantStyles[variant], sizeStyles[size], className)}
      {...props}
    />
  );
}
EOF

cat > packages/shared-ui/src/components/Button/index.ts << 'EOF'
export { Button } from './Button';
export type { ButtonProps } from './Button';
EOF

# Create main index
cat > packages/shared-ui/src/index.ts << 'EOF'
export * from './components/Button';
EOF
```

---

## E3: Update pnpm workspaces

### Step 3.1: Update pnpm-workspace.yaml

```bash
cat >> /workspaces/vtt_tormenta/pnpm-workspace.yaml << 'EOF'

  # New Fase 02 services
  - 'apps/compendium-service'
EOF
```

### Step 3.2: Install dependencies

```bash
cd /workspaces/vtt_tormenta
pnpm install
```

---

## E4: Update turbo.json for new services

```bash
cat > turbo.json << 'EOF'
{
  "globalDependencies": ["**/.env.local"],
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist", ".next"]
    },
    "test": {
      "dependsOn": ["build"]
    },
    "test:coverage": {
      "dependsOn": ["build"]
    },
    "typecheck": {
      "dependsOn": ["^build"]
    },
    "lint": {}
  }
}
EOF
```

---

## E5: Create environment template

```bash
cat > apps/compendium-service/.env.example << 'EOF'
COMPENDIUM_PORT=3040
MONGODB_URI=mongodb://localhost:27017/vtt_compendium
LOG_LEVEL=debug
ENVIRONMENT=development
EOF

cp apps/compendium-service/.env.example apps/compendium-service/.env.local
```

---

## E6: Verify builds

```bash
cd /workspaces/vtt_tormenta

# Build all packages
pnpm turbo run build

# Run tests
pnpm turbo run test

# Type check
pnpm turbo run typecheck

# Lint
pnpm turbo run lint
```

---

## 📝 Next Steps

After setup complete:

1. ✅ Branch: `git checkout -b fase-02/setup`
2. ✅ Commit: `git commit -m "setup: initialize compendium-service and shared-ui packages"`
3. ✅ Push: `git push origin fase-02/setup`
4. ✅ PR: Create PR for review
5. ✅ Merge to main

---

## 🎯 What to do next

**Immediately**:
- [ ] Execute setup checklist (E1-E6)
- [ ] Verify all builds pass
- [ ] Run `pnpm test` to ensure nothing broke

**This week**:
- [ ] Design Lighting Engine architecture
- [ ] Extract Tormenta20 data model
- [ ] Create SQL/MongoDB schemas

**Next week (Sprint 1 kickoff)**:
- [ ] Start LIGHT-01: Raycasting implementation
- [ ] Start COMP-01: Compendium CRUD API
- [ ] Start UI-01: SharedUI component library

---

**Status**: 🟢 **READY FOR EXECUTION**

**Time Estimate**: 4-6 hours  
**Next Checkpoint**: All builds passing + PR merged
