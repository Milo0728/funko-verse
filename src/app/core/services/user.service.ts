import { Injectable, inject } from '@angular/core';
import {
  Firestore,
  collection,
  collectionData,
} from '@angular/fire/firestore';
import { Observable } from 'rxjs';

import { AppUser } from '../../shared/models';

@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly firestore = inject(Firestore);

  getAll(): Observable<AppUser[]> {
    return collectionData(collection(this.firestore, 'users'), {
      idField: 'uid',
    }) as Observable<AppUser[]>;
  }
}
