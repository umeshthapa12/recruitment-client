import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import { Select } from '@ngxs/store';
import Quill from 'quill';
import { Observable } from 'rxjs';
import { filter, map, tap } from 'rxjs/operators';
import { ResponseModel, UsersModel } from '../../../../models';

@Component({
  templateUrl: './privacy-policy.component.html',
})
export class PrivacyPolicyComponent implements AfterViewInit {

  @Select('userLogin', 'employerInfo')
  readonly userData$: Observable<ResponseModel>;

  @ViewChild('pri')
  private readonly privacy: ElementRef<HTMLElement>;

  private staticData = `<p style="margin: 0in 0in 15pt; background-image: initial; background-position: initial; background-size: initial; background-repeat: initial; background-attachment: initial; background-origin: initial; background-clip: initial;"><strong><span style="font-size: 10.5pt; font-family: Arial; color: black;">Privacy Statement</span></strong><span style="font-size:10.5pt;
  font-family:&quot;Segoe UI&quot;,sans-serif;color:black"><o:p></o:p></span></p><span style="font-family: Arial;">

  </span><p style="margin: 0in 0in 15pt; background-image: initial; background-position: initial; background-size: initial; background-repeat: initial; background-attachment: initial; background-origin: initial; background-clip: initial;"><strong><span style="font-size: 10.5pt; font-family: Arial; color: black;">Overview</span></strong><span style="font-size:10.5pt;font-family:
  &quot;Segoe UI&quot;,sans-serif;color:black"><o:p></o:p></span></p><span style="font-family: Arial;">

  </span><p style="margin: 0in 0in 15pt; background-image: initial; background-position: initial; background-size: initial; background-repeat: initial; background-attachment: initial; background-origin: initial; background-clip: initial;"><span style="font-size:10.5pt;font-family:&quot;Segoe UI&quot;,sans-serif;
  color:black"><span style="font-family: Arial;">First Help Inc. Pvt. Ltd, and www.Jobharu .com, is committed to
  respecting the privacy of our users. We strive to provide a safe, secure user
  experience. This Privacy Statement sets forth the online data collection and
  usage policies and practices that apply to the Jobharu.com and does not apply
  to information we collect in any other fashion.</span><o:p></o:p></span></p><span style="font-family: Arial;">

  </span><p style="margin: 0in 0in 15pt; background-image: initial; background-position: initial; background-size: initial; background-repeat: initial; background-attachment: initial; background-origin: initial; background-clip: initial;"><span style="font-size:10.5pt;font-family:&quot;Segoe UI&quot;,sans-serif;
  color:black"><span style="font-family: Arial;">Your data will be stored and processed in whole or in part in the
  United States. The information we gather on the Jobharu.com will not be shared
  with any Third Party, without explicit written consent by you.</span><o:p></o:p></span></p><span style="font-family: Arial;">

  </span><p style="margin: 0in 0in 15pt; background-image: initial; background-position: initial; background-size: initial; background-repeat: initial; background-attachment: initial; background-origin: initial; background-clip: initial;"><span style="font-size:10.5pt;font-family:&quot;Segoe UI&quot;,sans-serif;
  color:black"><span style="font-family: Arial;">The Jobharu.com contains links to other Web sites over which we
  have no control. We are not responsible for the privacy policies or practices
  of other Web sites to which you choose to link from our Sites. We encourage you
  to review the privacy policies of those other Web sites so you can understand
  how they collect, use and share your information.</span><o:p></o:p></span></p><span style="font-family: Arial;">

  </span><p style="margin: 0in 0in 15pt; background-image: initial; background-position: initial; background-size: initial; background-repeat: initial; background-attachment: initial; background-origin: initial; background-clip: initial;"><strong><span style="font-size: 10.5pt; font-family: Arial; color: black;">Collection and Use of Information by </span></strong><b><span style="font-size:10.5pt;font-family:
  &quot;Segoe UI&quot;,sans-serif;color:black"><span style="font-family: Arial;">Jobharu</span><strong><span style="font-family: Arial;">.com</span></strong></span></b><span style="font-size:
  10.5pt;font-family:&quot;Segoe UI&quot;,sans-serif;color:black"><o:p></o:p></span></p><span style="font-family: Arial;">

  </span><p style="margin: 0in 0in 15pt; background-image: initial; background-position: initial; background-size: initial; background-repeat: initial; background-attachment: initial; background-origin: initial; background-clip: initial;"><span style="font-size:10.5pt;font-family:&quot;Segoe UI&quot;,sans-serif;
  color:black"><span style="font-family: Arial;">In some areas of Jobharu.com, we request or may request that you
  provide personal information, including your name, address, e-mail address,
  telephone number, credit card number, social security number, contact
  information, billing information and any other information from which your
  identity is discernible. In other areas, we collect or may collect demographic
  information that is not unique to you such as your ZIP code, age, preferences,
  gender, interests and favorite. Sometimes we collect or may collect a
  combination of the two types of information.</span><o:p></o:p></span></p><span style="font-family: Arial;">

  </span><p style="margin: 0in 0in 15pt; background-image: initial; background-position: initial; background-size: initial; background-repeat: initial; background-attachment: initial; background-origin: initial; background-clip: initial;"><span style="font-size:10.5pt;font-family:&quot;Segoe UI&quot;,sans-serif;
  color:black"><span style="font-family: Arial;">We also gather or may gather general information about your use of
  Jobharu.com such as what areas you visit and what services you access.
  Moreover, there is basic information about your computer hardware and software
  that is or may be collected by us. This information can include without
  limitation: your IP address, browser type, domain names, access times and
  referring Web site addresses, but is&nbsp;</span><u><span style="font-family: Arial;">not linked</span></u><span style="font-family: Arial;">&nbsp;to your
  personal information.</span><o:p></o:p></span></p><span style="font-family: Arial;">

  </span><p style="margin: 0in 0in 15pt; background-image: initial; background-position: initial; background-size: initial; background-repeat: initial; background-attachment: initial; background-origin: initial; background-clip: initial;"><span style="font-size:10.5pt;font-family:&quot;Segoe UI&quot;,sans-serif;
  color:black"><span style="font-family: Arial;">We may sometimes afford you the opportunity to provide
  descriptive, cultural, behavioral, and preferential and/or life style
  information about yourself, but it is solely up to you whether you furnish such
  information. If you do provide such information, you are thereby consenting to
  the use of that information in accordance with the policies and practices described
  in this Privacy Statement. For example, such information may be used for the
  purpose of determining your potential interest in receiving e-mail or other
  communications about particular products or services.</span><o:p></o:p></span></p><span style="font-family: Arial;">

  </span><p style="margin: 0in 0in 15pt; background-image: initial; background-position: initial; background-size: initial; background-repeat: initial; background-attachment: initial; background-origin: initial; background-clip: initial;"><strong><span style="font-size: 10.5pt; font-family: Arial; color: black;">Our Use of Your Information</span></strong><span style="font-size:
  10.5pt;font-family:&quot;Segoe UI&quot;,sans-serif;color:black"><o:p></o:p></span></p><span style="font-family: Arial;">

  </span><p style="margin: 0in 0in 15pt; background-image: initial; background-position: initial; background-size: initial; background-repeat: initial; background-attachment: initial; background-origin: initial; background-clip: initial;"><span style="font-size:10.5pt;font-family:&quot;Segoe UI&quot;,sans-serif;
  color:black"><span style="font-family: Arial;">We use the information we gather on Jobharu.com, whether personal,
  demographic, collective or technical, for the purpose of operating and
  improving the Jobharu.com, fostering a positive user experience, and delivering
  the products and services that we offer.</span><o:p></o:p></span></p><span style="font-family: Arial;">

  </span><p style="margin: 0in 0in 15pt; background-image: initial; background-position: initial; background-size: initial; background-repeat: initial; background-attachment: initial; background-origin: initial; background-clip: initial;"><span style="font-size:10.5pt;font-family:&quot;Segoe UI&quot;,sans-serif;
  color:black"><span style="font-family: Arial;">If you have provided consent for us to do so, we may also use the
  information we gather to inform you of other products or services available
  from us or our affiliated companies or to contact you about your opinion of
  current products and services or potential new products and services that may
  be offered.</span><o:p></o:p></span></p><span style="font-family: Arial;">

  </span><p style="margin: 0in 0in 15pt; background-image: initial; background-position: initial; background-size: initial; background-repeat: initial; background-attachment: initial; background-origin: initial; background-clip: initial;"><span style="font-size:10.5pt;font-family:&quot;Segoe UI&quot;,sans-serif;
  color:black"><span style="font-family: Arial;">We may use your contact information in order to send you e-mail or
  other communications regarding updates at the Jobharu.com, and if you have requested
  information on new Jobharu.com opportunities and additional job postings which
  may be of interest to you. The nature and frequency of these messages will vary
  depending upon the information we have about you.</span><o:p></o:p></span></p><span style="font-family: Arial;">

  </span><p style="margin: 0in 0in 15pt; background-image: initial; background-position: initial; background-size: initial; background-repeat: initial; background-attachment: initial; background-origin: initial; background-clip: initial;"><span style="font-size:10.5pt;font-family:&quot;Segoe UI&quot;,sans-serif;
  color:black"><span style="font-family: Arial;">In addition, at the time of registration, you have the option to
  elect to receive additional communications, information and promotions,
  including without limitation, free informational newsletters from us relating
  to topics that may be of special interest to you.</span><o:p></o:p></span></p><span style="font-family: Arial;">

  </span><p style="margin: 0in 0in 15pt; background-image: initial; background-position: initial; background-size: initial; background-repeat: initial; background-attachment: initial; background-origin: initial; background-clip: initial;"><span style="font-size:10.5pt;font-family:&quot;Segoe UI&quot;,sans-serif;
  color:black"><span style="font-family: Arial;">We have areas on the Jobharu.com where you can submit feedback.
  Any feedback you submit in these areas becomes our property, and we can use
  such feedback (such as success stories) for marketing purposes or to contact
  you for further information.</span><o:p></o:p></span></p><span style="font-family: Arial;">

  </span><p style="margin: 0in 0in 15pt; background-image: initial; background-position: initial; background-size: initial; background-repeat: initial; background-attachment: initial; background-origin: initial; background-clip: initial;"><strong><span style="font-size: 10.5pt; font-family: Arial; color: black;">Choices Regarding the Disclosure of Personal Information to Others</span></strong><span style="font-size:10.5pt;font-family:&quot;Segoe UI&quot;,sans-serif;color:black"><o:p></o:p></span></p><span style="font-family: Arial;">

  </span><p style="margin: 0in 0in 15pt; background-image: initial; background-position: initial; background-size: initial; background-repeat: initial; background-attachment: initial; background-origin: initial; background-clip: initial;"><span style="font-size:10.5pt;font-family:&quot;Segoe UI&quot;,sans-serif;
  color:black"><span style="font-family: Arial;">We do not disclose your personal information to third parties, or
  your combined personal and demographic information or information about your
  use of Jobharu.com </span><o:p></o:p></span></p><span style="font-family: Arial;">

  </span><p style="margin: 0in 0in 15pt; background-image: initial; background-position: initial; background-size: initial; background-repeat: initial; background-attachment: initial; background-origin: initial; background-clip: initial;"><span style="color: rgb(0, 0, 0);"><span style="font-family: Arial;">We disclose information to companies and individuals we employ to
  perform functions on our behalf. Examples include hosting our Web servers,
  analyzing data, providing marketing assistance, processing credit card
  payments, and providing customer service. These companies and individuals will
  have access to your personal information as necessary to perform their
  functions, but they may not share that information with any other third party.</span><o:p></o:p></span></p><span style="font-family: Arial;">

  </span><p style="margin: 0in 0in 15pt; background-image: initial; background-position: initial; background-size: initial; background-repeat: initial; background-attachment: initial; background-origin: initial; background-clip: initial;"><span style="color: rgb(0, 0, 0); font-family: Arial;">We disclose information if legally required to do so, if requested
  to do so by a governmental entity or if we believe in good faith that such
  action is necessary to: (a) conform to legal requirements or comply with legal
  process; (b) protect our rights or property; (c) prevent a crime or protect
  national security; or (d) protect the personal safety of users or the public.</span><span style="color: black; font-family: &quot;Segoe UI&quot;, sans-serif; font-size: 10.5pt;"><o:p></o:p></span></p><span style="font-family: Arial;">

  </span><p style="margin: 0in 0in 15pt; background-image: initial; background-position: initial; background-size: initial; background-repeat: initial; background-attachment: initial; background-origin: initial; background-clip: initial;"><strong><span style="font-size: 10.5pt; font-family: Arial; color: black;">Other Uses of Information</span></strong><span style="font-size:
  10.5pt;font-family:&quot;Segoe UI&quot;,sans-serif;color:black"><o:p></o:p></span></p><span style="font-family: Arial;">

  </span><p style="margin: 0in 0in 15pt; background-image: initial; background-position: initial; background-size: initial; background-repeat: initial; background-attachment: initial; background-origin: initial; background-clip: initial;"><span style="font-size:10.5pt;font-family:&quot;Segoe UI&quot;,sans-serif;
  color:black"><span style="font-family: Arial;">We also share aggregated anonymous information about visitors to Jobharu
  (for example, the number of visitors) with its clients, partners and other
  third parties so that they can understand the kinds of visitors to the Jobharu.com
  and how those visitors use the Jobharu.com.</span><o:p></o:p></span></p><span style="font-family: Arial;">

  </span><p style="margin: 0in 0in 15pt; background-image: initial; background-position: initial; background-size: initial; background-repeat: initial; background-attachment: initial; background-origin: initial; background-clip: initial;"><span style="font-size:10.5pt;font-family:&quot;Segoe UI&quot;,sans-serif;
  color:black"><span style="font-family: Arial;">If you apply for a position via a contact listed on the Jobharu.com,
  you may be asked to provide information on your gender, race or other protected
  status where permitted by applicable law. Some employers are required by law to
  gather this information from job applicants for reporting and record-keeping
  requirements. You should understand that if provided, this information will be
  used by employers only in accordance with applicable law and will not be used
  in making any negative employment decisions. All information provided will be
  kept separate from your expression of interest in any job opportunity.
  Providing this information is strictly voluntary and you will not be subject to
  any adverse action or treatment if you choose not to provide this information.</span><o:p></o:p></span></p><span style="font-family: Arial;">

  </span><p style="margin: 0in 0in 15pt; background-image: initial; background-position: initial; background-size: initial; background-repeat: initial; background-attachment: initial; background-origin: initial; background-clip: initial;"><strong><span style="font-size: 10.5pt; font-family: Arial; color: black;">Use of Cookies</span></strong><span style="font-size:10.5pt;
  font-family:&quot;Segoe UI&quot;,sans-serif;color:black"><o:p></o:p></span></p><span style="font-family: Arial;">

  </span><p style="margin: 0in 0in 15pt; background-image: initial; background-position: initial; background-size: initial; background-repeat: initial; background-attachment: initial; background-origin: initial; background-clip: initial;"><span style="font-size:10.5pt;font-family:&quot;Segoe UI&quot;,sans-serif;
  color:black"><span style="font-family: Arial;">We use "cookies" to help personalize and maximize your
  online experience and time online. A cookie is a text file that is placed on
  your hard drive by a Web page server. Cookies are not used to run programs or
  deliver viruses to your computer. Cookies are uniquely assigned to your
  computer, and can only be read by a Web server in the domain that issued the
  cookie to you.</span><o:p></o:p></span></p><span style="font-family: Arial;">

  </span><p style="margin: 0in 0in 15pt; background-image: initial; background-position: initial; background-size: initial; background-repeat: initial; background-attachment: initial; background-origin: initial; background-clip: initial;"><span style="font-size:10.5pt;font-family:&quot;Segoe UI&quot;,sans-serif;
  color:black"><span style="font-family: Arial;">One of the primary purposes of cookies is to provide a convenience
  feature to save you time. The purpose of a cookie is to tell the Web server
  that you have returned to a specific page. For example, if you register, a
  cookie helps us to recall your specific information (such as user name,
  password and preferences). Because of our use of cookies, we can deliver faster
  and more accurate results and a more personalized site experience. When you
  return to Jobharu.com, the information you previously provided can be
  retrieved, so you can easily use the features that you customized. We also use
  cookies to track click streams and for load balancing.</span><o:p></o:p></span></p><span style="font-family: Arial;">

  </span><p style="margin: 0in 0in 15pt; background-image: initial; background-position: initial; background-size: initial; background-repeat: initial; background-attachment: initial; background-origin: initial; background-clip: initial;"><span style="font-size:10.5pt;font-family:&quot;Segoe UI&quot;,sans-serif;
  color:black"><span style="font-family: Arial;">You may have the ability to accept or decline cookies. Most Web
  browsers automatically accept cookies, but you can usually modify your browser
  setting to decline all cookies if you prefer. Alternatively, you may be able to
  modify your browser setting to notify you each time a cookie is tendered and
  permit you to accept or decline cookies on an individual basis. If you choose
  to decline cookies, however, that may hinder performance and negatively impact
  your experience on Jobharu.com.</span><o:p></o:p></span></p><span style="font-family: Arial;">

  </span><p style="margin: 0in 0in 15pt; background-image: initial; background-position: initial; background-size: initial; background-repeat: initial; background-attachment: initial; background-origin: initial; background-clip: initial;"><strong><span style="font-size: 10.5pt; font-family: Arial; color: black;">Access to and Modification of Your Information</span></strong><span style="font-size:10.5pt;font-family:&quot;Segoe UI&quot;,sans-serif;color:black"><o:p></o:p></span></p><span style="font-family: Arial;">

  </span><p style="margin: 0in 0in 15pt; background-image: initial; background-position: initial; background-size: initial; background-repeat: initial; background-attachment: initial; background-origin: initial; background-clip: initial;"><span style="font-size:10.5pt;font-family:&quot;Segoe UI&quot;,sans-serif;
  color:black"><span style="font-family: Arial;">You may review, correct, update or change your account information
  at Jobharu.com at any time.</span><o:p></o:p></span></p><span style="font-family: Arial;">

  </span><p style="margin: 0in 0in 15pt; background-image: initial; background-position: initial; background-size: initial; background-repeat: initial; background-attachment: initial; background-origin: initial; background-clip: initial;"><span style="font-size:10.5pt;font-family:&quot;Segoe UI&quot;,sans-serif;
  color:black"><span style="font-family: Arial;">To change your Jobharu.com profile, simply log into your account.
  Once logged in, you'll arrive at the Profile page. Click on the link that&nbsp;</span><strong><span style="font-family: Arial;">Change Account Status</span></strong><span style="font-family: Arial;">,
  and you can make any changes you like. Be sure to click&nbsp;</span><strong><span style="font-family: Arial;">Save Changes</span></strong><span style="font-family: Arial;">&nbsp;before
  you exit.</span><o:p></o:p></span></p><span style="font-family: Arial;">

  </span><p style="margin: 0in 0in 15pt; background-image: initial; background-position: initial; background-size: initial; background-repeat: initial; background-attachment: initial; background-origin: initial; background-clip: initial;"><span style="font-size:10.5pt;font-family:&quot;Segoe UI&quot;,sans-serif;
  color:black"><span style="font-family: Arial;">To change your Jobharu.com billing account information
  (Employers), simply log into your Jobharu.com account and choose a link under
  Manage Your Account.</span><o:p></o:p></span></p><span style="font-family: Arial;">

  </span><p style="margin: 0in 0in 15pt; background-image: initial; background-position: initial; background-size: initial; background-repeat: initial; background-attachment: initial; background-origin: initial; background-clip: initial;"><span style="font-size:10.5pt;font-family:&quot;Segoe UI&quot;,sans-serif;
  color:black"><span style="font-family: Arial;">If you opted to receive newsletters, commercial e-mails or other
  communications from Jobharu.com, but subsequently change your mind, you may
  opt-out by editing your Account Profile as described above. If you previously
  opted not to receive such communications, you may later opt-in by editing your
  Account Profile as well.</span><o:p></o:p></span></p><span style="font-family: Arial;">

  </span><p style="margin: 0in 0in 15pt; background-image: initial; background-position: initial; background-size: initial; background-repeat: initial; background-attachment: initial; background-origin: initial; background-clip: initial;"><strong><span style="font-size: 10.5pt; font-family: Arial; color: black;">Security of the Personal Information</span></strong><span style="font-size:10.5pt;font-family:&quot;Segoe UI&quot;,sans-serif;color:black"><o:p></o:p></span></p><span style="font-family: Arial;">

  </span><p style="margin: 0in 0in 15pt; background-image: initial; background-position: initial; background-size: initial; background-repeat: initial; background-attachment: initial; background-origin: initial; background-clip: initial;"><span style="font-size:10.5pt;font-family:&quot;Segoe UI&quot;,sans-serif;
  color:black"><span style="font-family: Arial;">We have implemented commercially reasonable technical and
  organizational measures designed to secure your personal information from
  accidental loss and from unauthorized access, use, alteration or disclosure.
  However, we cannot guarantee that unauthorized third parties will never be able
  to defeat those measures or use your personal information for improper
  purposes.</span><o:p></o:p></span></p><span style="font-family: Arial;">

  </span><p style="margin: 0in 0in 15pt; background-image: initial; background-position: initial; background-size: initial; background-repeat: initial; background-attachment: initial; background-origin: initial; background-clip: initial;"><strong><span style="font-size: 10.5pt; font-family: Arial; color: black;">Changes to Privacy Statement</span></strong><span style="font-size:10.5pt;font-family:&quot;Segoe UI&quot;,sans-serif;color:black"><o:p></o:p></span></p><span style="font-family: Arial;">

  </span><p style="margin: 0in 0in 15pt; background-image: initial; background-position: initial; background-size: initial; background-repeat: initial; background-attachment: initial; background-origin: initial; background-clip: initial;"><span style="font-size:10.5pt;font-family:&quot;Segoe UI&quot;,sans-serif;
  color:black"><span style="font-family: Arial;">If we decide to materially change our Privacy Statement for the Jobharu.com,
  we will post those changes through a prominent notice on the web site so that
  you will always know what information we gather, how we might use that
  information, and to whom we will disclose it.</span><o:p></o:p></span></p><span style="font-family: Arial;">

  </span><p style="margin: 0in 0in 15pt; background-image: initial; background-position: initial; background-size: initial; background-repeat: initial; background-attachment: initial; background-origin: initial; background-clip: initial;"><span style="font-size:10.5pt;font-family:&quot;Segoe UI&quot;,sans-serif;
  color:black"><span style="font-family: Arial;">If at any time, you have questions or concerns about this Privacy
  Statement or believe that we have not adhered to this Privacy Statement, please
  feel free to email us at&nbsp;</span><span class="MsoHyperlink"><a href="mailto:info@kumarijob.co"><span style="color: black; font-family: Arial;">info@</span><span style="color: black; font-family: Arial;"> </span><span style="color: black; font-family: Arial;">Jobharu.co</span></a><span style="font-family: Arial;">m</span></span><span style="font-family: Arial;">&nbsp;or
  call us at +9779851181542. We will use commercially reasonable efforts to
  promptly answer your question or resolve your problem.</span><o:p></o:p></span></p><span style="font-family: Arial;">

  </span><p style="margin: 0in 0in 15pt; background-image: initial; background-position: initial; background-size: initial; background-repeat: initial; background-attachment: initial; background-origin: initial; background-clip: initial;"><strong><span style="font-size: 10.5pt; font-family: Arial; color: black;">Contact Information</span></strong><span style="font-size:10.5pt;
  font-family:&quot;Segoe UI&quot;,sans-serif;color:black"><o:p></o:p></span></p><span style="font-family: Arial;">

  </span><p style="margin: 0in 0in 15pt; background-image: initial; background-position: initial; background-size: initial; background-repeat: initial; background-attachment: initial; background-origin: initial; background-clip: initial;"><span style="font-size:10.5pt;font-family:&quot;Segoe UI&quot;,sans-serif;
  color:black"><span style="font-family: Arial;">Jobharu.com is the name under which Help Inc Pvt Ltd.,
  &nbsp;registered under company act 2063. Having office located at #02,
  Baisnodevi Marg, Ekantakuna-13, Lalitpur, Nepal. 44700,&nbsp; Kathmandu, Nepal.</span><o:p></o:p></span></p><span style="font-family: Arial;">

  </span><p style="margin: 0in 0in 15pt; background-image: initial; background-position: initial; background-size: initial; background-repeat: initial; background-attachment: initial; background-origin: initial; background-clip: initial;"><span style="font-size:10.5pt;font-family:&quot;Segoe UI&quot;,sans-serif;
  color:black"><span style="font-family: Arial;">Thank you for using Jobharu.com.&nbsp;</span><o:p></o:p></span></p><span style="font-family: Arial;">

  </span><p class="MsoNormal"><o:p><span style="font-family: Arial;">&nbsp;</span></o:p></p>`;

  constructor() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }


  private initQuillData(el: HTMLElement, d: string) {

    if (!el || (d || '') === '') return;
    const ql = new Quill(el, {
      readOnly: true,
      modules: {
        toolbar: false
      }
    });
    ql.setContents(JSON.parse(d));
  }

  ngAfterViewInit() {

    this.userData$.pipe(
      tap(_ => _ && _.contentBody !== '' ? '' : this.privacy.nativeElement.innerHTML = this.staticData),
      filter(_ => _ && _.contentBody),
      map(_ => ({ ...<UsersModel>_.contentBody })),
    ).subscribe({
      next: model => this.initQuillData(this.privacy.nativeElement, model.privacy)
    });
  }

}
