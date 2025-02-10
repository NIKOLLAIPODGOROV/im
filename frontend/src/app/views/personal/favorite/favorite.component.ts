import {Component, Input, OnInit} from '@angular/core';
import {FavoriteService} from "../../../shared/services/favorite.service";
import {FavoriteType} from "../../../../types/favorite.type";
import {DefaultResponseType} from "../../../../types/default-response.type";
import {environment} from "../../../../environments/environment";
import {CartType} from "../../../../types/cart.type";
import {CartService} from "../../../shared/services/cart.service";
import {ProductType} from "../../../../types/product.type";
import {AuthService} from "../../../core/auth/auth.service";

@Component({
  selector: 'app-favorite',
  templateUrl: './favorite.component.html',
  styleUrls: ['./favorite.component.scss']
})
export class FavoriteComponent implements OnInit {

  @Input() product!: ProductType;
  @Input() countInCart: number | undefined = 0;

  count: number = 1;
  products: FavoriteType[] = [];
  serverStaticPath = environment.serverStaticPath;

  constructor(private favoriteService: FavoriteService,
              private cartService: CartService,
              private authService: AuthService) {
  }

  ngOnInit(): void {
    if (this.countInCart && this.countInCart > 1) {
      this.count = this.countInCart;
    }

    this.favoriteService.getFavorites()
      .subscribe((data: FavoriteType[] | DefaultResponseType) => {
        if ((data as DefaultResponseType).error !== undefined) {
          const error = (data as DefaultResponseType).message;
          throw new Error(error);
        }
        this.countInCart = 0;
        this.products = data as FavoriteType[];
      });

    this.cartService.getCartCount()
      .subscribe((data: { count: number } | DefaultResponseType) => {
        if ((data as DefaultResponseType).error !== undefined) {
          throw new Error((data as DefaultResponseType).message);
        }

        this.count = (data as { count: number }).count;
      });

    this.cartService.count$
      .subscribe(count => {
        this.count = count;
      })

  }

  addToCart() {
    this.cartService.getCart()

   // this.cartService.updateCart(this.product.id, this.count)
      .subscribe((data: CartType | DefaultResponseType) => {
        if ((data as DefaultResponseType).error !== undefined) {
          throw new Error((data as DefaultResponseType).message);
        }
        this.countInCart = this.count;
      });

  }

  removeFromFavorites(id: string) {
    this.favoriteService.removeFavorite(id)
      .subscribe((data: DefaultResponseType) => {
        if (data.error) {
          //...
          throw new Error(data.message);
        }

        this.products = this.products.filter(item => item.id !== id);
      })
  }

  removeFromCart() {
    this.cartService.updateCart(this.product.id, 0)
      .subscribe((data: CartType | DefaultResponseType) => {
        if ((data as DefaultResponseType).error !== undefined) {
          throw new Error((data as DefaultResponseType).message);
        }

        this.countInCart = 0;
        this.count = 1;
      });
  }

}
