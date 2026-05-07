import { generateId } from '@vtt/shared-utils';
import { TableState } from '@vtt/shared-types';

interface TableProps {
  id: string;
  campaignId: string;
  name: string;
  activeMapId: string | null;
  state: TableState;
  createdAt: Date;
}

export class Table {
  readonly id: string;
  readonly campaignId: string;
  name: string;
  activeMapId: string | null;
  state: TableState;
  readonly createdAt: Date;

  private constructor(props: TableProps) {
    this.id = props.id;
    this.campaignId = props.campaignId;
    this.name = props.name;
    this.activeMapId = props.activeMapId;
    this.state = props.state;
    this.createdAt = props.createdAt;
  }

  static create(props: { campaignId: string; name: string }): Table {
    return new Table({
      id: generateId(),
      campaignId: props.campaignId,
      name: props.name.trim(),
      activeMapId: null,
      state: TableState.IDLE,
      createdAt: new Date(),
    });
  }

  static reconstitute(props: TableProps): Table {
    return new Table(props);
  }

  startSession(): void {
    this.state = TableState.IN_SESSION;
  }

  endSession(): void {
    this.state = TableState.IDLE;
  }

  setActiveMap(mapId: string | null): void {
    this.activeMapId = mapId;
  }
}
