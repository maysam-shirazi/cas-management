import {Component} from '@angular/core';
import {DefaultRegisteredServiceContact} from 'domain-lib';
import {UserService} from 'shared-lib';
import {TabContactsForm} from './tab-contacts.form';
import {DataRecord} from 'mgmt-lib';

@Component({
  selector: 'app-tab-contacts',
  templateUrl: './tab-contacts.component.html'
})
export class TabContactsComponent {

  form: TabContactsForm;
  readonly key = 'contacts';

  constructor(public data: DataRecord,
              private user: UserService) {
    if (this.data.formMap.has(this.key)) {
      this.form = this.data.formMap.get(this.key) as TabContactsForm;
      return;
    }
    this.form = new TabContactsForm(this.data.service);
    if (!this.user.user.administrator
        && (!this.data.service.contacts || this.data.service.contacts.length === 0)) {
      const contact: DefaultRegisteredServiceContact = new DefaultRegisteredServiceContact();
      contact.name = this.user.user.firstName + ' ' + this.user.user.familyName;
      contact.email = this.user.user.email;
      contact.phone = this.user.user.phone;
      contact.department = this.user.user.department;
      this.form.contacts.addRow(contact);
    }
    this.data.formMap.set(this.key, this.form);
  }
}
