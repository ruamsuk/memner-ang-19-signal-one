import { Injectable } from '@angular/core';
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
  setDoc,
  updateDoc,
  where,
} from '@angular/fire/firestore';
import { catchError, from, map, Observable, of } from 'rxjs';
import { Member } from '../models/member.model';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  constructor(private firestore: Firestore) {}

  addUser(user: {
    uid: string;
    displayName: string | null | undefined;
    email: string | null | undefined;
  }) {
    const ref = doc(this.firestore, 'users', `${user.uid}`);
    return from(setDoc(ref, user));
  }

  // getUserDetail(): Observable<User> {
  //   return user(this.auth).pipe(
  //     switchMap((user: User) => {
  //       if (user) {
  //         collection(this.firestore, 'users');
  //         const query = doc(this.firestore, 'users', `${user.uid}`);
  //         return collectionData(query, { idField: 'id' }) as Observable<User[]>;
  //       } else {
  //         return of([]);
  //       }
  //     }),
  //   );
  // }

  loadMembers() {
    const dbInstance = collection(this.firestore, 'members');
    const userQuery = query(dbInstance, orderBy('firstname', 'asc'));
    return collectionData(userQuery, { idField: 'id' });
  }

  deleteMember(id: string | undefined) {
    const docInstance = doc(this.firestore, 'members', `${id}`);
    return from(deleteDoc(docInstance));
  }

  updateMember(member: any): Observable<any> {
    const docInstance = doc(this.firestore, `members/${member.id}`);

    return from(updateDoc(docInstance, { ...member, updated: new Date() }));
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
    return from(addDoc(docRef, { ...member, created: new Date() }));
  }
}
