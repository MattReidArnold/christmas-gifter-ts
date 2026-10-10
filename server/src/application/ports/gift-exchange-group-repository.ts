import GiftExchangeGroup from '#src/domain/gift-exchange-group';

export default interface GiftExchangeGroupRepository {
  getById: (id: string) => Promise<GiftExchangeGroup | null>;
  add: (group: GiftExchangeGroup) => Promise<GiftExchangeGroup>;
  update: (group: GiftExchangeGroup) => Promise<GiftExchangeGroup | null>;
}
