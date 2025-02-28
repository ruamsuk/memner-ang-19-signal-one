import { inject, Injectable } from '@angular/core';
import {
  addDoc,
  collection,
  collectionData,
  deleteDoc,
  doc,
  Firestore,
  getDocs,
  orderBy,
  query,
  updateDoc,
  where
} from '@angular/fire/firestore';
import { catchError, from, map, Observable, of } from 'rxjs';
import { Member } from '../models/member.model';

@Injectable({
  providedIn: 'root'
})
export class MembersService {
  private readonly firestore: Firestore = inject(Firestore);

  constructor() {
  }

  /** work 4 resource() */
  // getMembers(): Promise<Member[]> {
  //   return new Promise((resolve, reject) => {
  //     collectionData(collection(this.firestore, 'members'), {idField: 'id'}).subscribe({
  //       next: (members: Member[]) => {
  //         resolve(members);
  //       },
  //       error: (error) => {
  //         reject(error);
  //       }
  //     });
  //   });
  // }


  /** work for toSignal() */
  getMembers(): Observable<Member[]> {
    const memberCollection = collection(this.firestore, 'members');
    const userQuery = query(memberCollection, orderBy('firstname', 'asc'));

    return collectionData(userQuery, {idField: 'id'}) as Observable<Member[]>;
  }

  deleteMember(id: string | undefined) {
    const docInstance = doc(this.firestore, 'members', `${id}`);
    return from(deleteDoc(docInstance));
  }

  updateMember(member: any): Observable<any> {
    const docInstance = doc(this.firestore, `members/${member.id}`);

    return from(updateDoc(docInstance, {...member, updated: new Date()}));
  }

  checkDuplicate(firstname: string, lastname: string): Observable<boolean> {
    const dbInstance = collection(this.firestore, 'members');
    const q = query(
      dbInstance,
      where('firstname', '==', firstname),
      where('lastname', '==', lastname),
    );
    return from(getDocs(q)).pipe(
      map((querySnapshot) => querySnapshot.size > 0),
      catchError(() => of(false)),
    );
  }

  addMember(member: Member): Observable<any> {
    const docRef = collection(this.firestore, 'members');
    return from(addDoc(docRef, {...member, created: new Date()}));
  }
}
