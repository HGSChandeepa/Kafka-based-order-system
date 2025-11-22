export class PriceAggregator {
  private totalOrders = 0;
  private totalPrice = 0;

  update(price: number): number {
    this.totalOrders += 1;
    this.totalPrice += price;
    return this.totalPrice / this.totalOrders;
  }

  getCurrentAverage(): number {
    return this.totalOrders > 0 ? this.totalPrice / this.totalOrders : 0;
  }

  getStats(): { totalOrders: number; totalPrice: number; average: number } {
    return {
      totalOrders: this.totalOrders,
      totalPrice: this.totalPrice,
      average: this.getCurrentAverage(),
    };
  }
}