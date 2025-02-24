import { inject, Injectable } from '@angular/core';
import { collection, collectionData, Firestore } from '@angular/fire/firestore';
import { Member } from '../models/member.model';

@Injectable({
  providedIn: 'root'
})
export class MembersService {
  private readonly firestore: Firestore = inject(Firestore);

  constructor() {
  }

  /** work */
  getMembers(): Promise<Member[]> {
    return new Promise((resolve, reject) => {
      collectionData(collection(this.firestore, 'members'), {idField: 'id'}).subscribe({
        next: (members: Member[]) => {
          resolve(members);
        },
        error: (error) => {
          reject(error);
        }
      });
    });
  }

  /** Not work for resource */
  // getMembers(): Observable<Member[]> {
  //   const memberCollection = collection(this.firestore, 'members');
  //   return collectionData(memberCollection, {idField: 'id'}) as Observable<Member[]>;
  // }
}
