import * as admin from 'firebase-admin';
import { QuerySnapshot } from 'firebase-admin/firestore';
import * as functions from 'firebase-functions';

// // Start writing functions
// // https://firebase.google.com/docs/functions/typescript
//
admin.initializeApp();

export const getAllApproves = functions.https.onRequest(async (request, response) => {
  response.set('Access-Control-Allow-Origin', '*');
  response.set('Access-Control-Allow-Headers', 'Content-Type');
  response.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
  response.set('Content-Type', 'application/json; charset=utf-8');
  if (request.method === 'GET') {
    const data: QuerySnapshot = await admin
      .firestore()
      .collection('approves').get();
    if (!data.empty) {
      const result = data.docs.filter((doc) => doc.exists).map((doc) => {
        // functions.logger.info(doc.id);
        const result = doc.data();
        result.id = doc.id;
        return result;
      });
      response.status(200).json({ data: result });
      return;
    }
    response.status(404).send('Not Found');
    return;
  } else {
    if (request.method == 'OPTIONS') {
      response.status(200).send('OK');
      return;
    }
    response.status(405).send('Method Not Allowed');
    return;
  }
});

export const xinNghiPhep = functions.https.onRequest(async (request, response) => {
  response.set('Access-Control-Allow-Origin', '*');
  response.set('Access-Control-Allow-Headers', 'Content-Type');
  if (request.method === 'POST') {
    const email = request.body.email;
    const name = request.body.name;
    const title = request.body.title;
    const unit = request.body.unit;
    const type = request.body.type;
    const mode = request.body.mode;
    const fromDate = request.body.fromDate;
    const toDate = request.body.toDate;
    const reason = request.body.reason;
    const days = request.body.days;
    const fromTime = request.body.fromTime;
    const toTime = request.body.toTime;
    // const missionFromDate = request.body.missionFromDate;
    // const missionToDate = request.body.missionToDate;
    // const missionFromTime = request.body.missionFromTime;
    // const missionToTime = request.body.missionToTime;
    const onDate = request.body.onDate;
    // const where = request.body.where;

    functions.logger.info('email', email);

    const emailList = [
      // 'samco.mailtn@gmail.com',
      email];
    let confirmMail = '';
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let unitEmails: any[] = [];

    const data: QuerySnapshot = await admin
      .firestore()
      .collection('units').get();
    if (!data.empty) {
      unitEmails = data.docs.filter((doc) => doc.exists && doc.data()['emailPGD']).map((doc) => {
        // functions.logger.info(doc.id);
        const result = doc.data();
        result.id = doc.id;
        return result;
      });
    }
    const phongBan = unitEmails.find((u) => u.id == unit);
    let approvedByQLPB = false;
    if (title == 'Nhân viên/KTV') {
      confirmMail = phongBan.emailQLPB ? phongBan.emailQLPB : phongBan.emailPGD;
    } else if (title != 'Nhân viên/KTV') {
      confirmMail = phongBan.emailPGD;
      approvedByQLPB = true;
    }
    // response.send(emailList);
    // return;


    const subject = `Đơn xin ${type} - ${name} - ${unit}`;

    const bodyNghiPhep = `<table>
      <tr><td>Email</td><td style="color: #d71920;">${email}</td></tr>
      <tr><td>Tên</td><td>${name}</td></tr>
      <tr><td>Chức danh</td><td>${title}</td></tr>
      <tr><td>Đơn vị</td><td>${unit}</td></tr>
      <tr><td>Mong muốn</td><td>${type}</td></tr>
      <tr><td>Từ ngày</td><td>${fromDate}</td></tr>
      <tr><td>Đến ngày</td><td>${toDate}</td></tr>
      <tr><td>Theo chế độ</td><td>${mode}</td></tr>
      <tr><td>Số ngày đề nghị</td><td>${days}</td></tr>
      <tr style='vertical-align: top;'><td style='white-space:nowrap'>Lý do</td><td>${reason}</td></tr>
    </table>`;

    const bodyChamCong = `<table>
      <tr><td>Email</td><td style="color: #d71920;">${email}</td></tr>
      <tr><td>Tên</td><td>${name}</td></tr>
      <tr><td>Chức danh</td><td>${title}</td></tr>
      <tr><td>Đơn vị</td><td>${unit}</td></tr>
      <tr><td>Mong muốn</td><td>${type}</td></tr>
      <tr><td>Giờ vào</td><td>${fromTime}</td></tr>
      <tr><td>Giờ ra</td><td>${toTime}</td></tr>
      <tr><td>Ngày cần điều chỉnh</td><td>${onDate}</td></tr>
      <tr style='vertical-align: top;'><td style='white-space:nowrap'>Lý do</td><td>${reason}</td></tr>
    </table>`;

    const bodyCongTac = `<table>
      <tr><td>Email</td><td style="color: #d71920;">${email}</td></tr>
      <tr><td>Tên</td><td>${name}</td></tr>
      <tr><td>Chức danh</td><td>${title}</td></tr>
      <tr><td>Đơn vị</td><td>${unit}</td></tr>
      <tr><td>Mong muốn</td><td>${type}</td></tr>
      <tr><td>Thời gian bắt đầu</td><td>${fromTime}</td></tr>
      <tr><td>Ngày bắt đầu công tác</td><td>${fromDate}</td></tr>
      <tr><td>Thời gian kết thúc</td><td>${toTime}</td></tr>
      <tr><td>Ngày kết thúc công tác</td><td>${toDate}</td></tr>
      <tr style='vertical-align: top;'><td style='white-space:nowrap'>Nơi công tác</td><td>${reason}</td></tr>
    </table>`;

    const body = type == 'Nghỉ phép' ? bodyNghiPhep : type == 'Điều chỉnh chấm công' ? bodyChamCong : bodyCongTac;

    const html = htmlTemplate.replace('{{type}}', type).replace('{{table}}', body);
    const pendingData = { ...request.body, approvedByQLPB: approvedByQLPB, approvedByPGD: false, createdAt: new Date() };
    pendingData.unit = phongBan;
    functions.logger.info(confirmMail);
    await admin
      .firestore()
      .collection('pendings').add(pendingData).then((docRef) => {
        const id = docRef.id;
        // confirmMailList.map((e) => {
        // const e = confirmMail;
        const confirmBody = body.replace('</table>', `<tr>
          <td>Link xác nhận</td>
          <td><a style="color: #e91218; text-decodation:underline" href="https://xin-nghi-phep-7ff68.web.app/duyet-nghi-phep/${id}?reviewer=${confirmMail}">Xác nhận</a></td>
        </tr></table>`);
        const confirmHtml = htmlTemplate.replace('{{type}}', type).replace('{{table}}', confirmBody);
        sendEmail(confirmMail, subject, confirmHtml, phongBan.xemTT);
      });
    // admin
    //   .firestore()
    //   .collection('mails')
    //   .add({
    //     to: email,
    //     message: {
    //       subject: subject,
    //       text: subject,
    //       html: html,
    //     },
    //     cc: ['binhhm2009@gmail.com', ...phongBan.xemTT ?? []],
    //   })
    //   .then(() => functions.logger.info('Queued email for delivery!'));
    sendEmail(email, subject, html);
    response.send({ 'data': html });
    return;
  } else {
    if (request.method == 'OPTIONS') {
      response.status(200).send('OK');
      return;
    }
    response.status(405).send('Method Not Allowed');
    return;
  }
});

export const duyetNghiPhep = functions.https.onRequest(async (request, response) => {
  response.set('Access-Control-Allow-Origin', '*');
  response.set('Access-Control-Allow-Headers', 'Content-Type');
  response.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  if (request.method === 'POST') {
    const id = request.body.id;
    const isApproved = request.body.isApproved;
    const pendingRef = admin.firestore().collection('pendings').doc(id);
    const pending = await pendingRef.get();
    const reviewer = request.body.reviewer;
    const form = pending.data() ?? {};
    const email = form.email;
    const name = form.name;
    const title = form.title;
    const unit = form.unit;
    const type = form.type;
    const mode = form.mode;
    const fromDate = form.fromDate;
    const toDate = form.toDate;
    const reason = form.reason;
    const days = form.days;
    const fromTime = form.fromTime;
    const toTime = form.toTime;
    // const missionFromDate = form.missionFromDate;
    // const missionToDate = form.missionToDate;
    // const missionFromTime = form.missionFromTime;
    // const missionToTime = form.missionToTime;
    const onDate = form.onDate;
    // const where = form.where;
    // const changeReason = form.changeReason;
    const rejectReason = request.body.rejectReason ?? '';

    let subject = `${type} - ${name} - ${unit.id}`;

    const bodyNghiPhep = `<table>
      <tr><td>Email</td><td style="color: #d71920;">${email}</td></tr>
      <tr><td>Tên</td><td>${name}</td></tr>
      <tr><td>Chức danh</td><td>${title}</td></tr>
      <tr><td>Đơn vị</td><td>${unit.id}</td></tr>
      <tr><td>Mong muốn</td><td>${type}</td></tr>
      <tr><td>Từ ngày</td><td>${fromDate}</td></tr>
      <tr><td>Đến ngày</td><td>${toDate}</td></tr>
      <tr><td>Theo chế độ</td><td>${mode}</td></tr>
      <tr><td>Số ngày đề nghị</td><td>${days}</td></tr>
      <tr style='vertical-align: top;'><td style='white-space:nowrap'>Lý do</td><td>${reason}</td></tr>
      <tr><td>Người duyệt</td><td>${reviewer}</td></tr>
    </table>`;

    const bodyChamCong = `<table>
      <tr><td>Email</td><td style="color: #d71920;">${email}</td></tr>
      <tr><td>Tên</td><td>${name}</td></tr>
      <tr><td>Chức danh</td><td>${title}</td></tr>
      <tr><td>Đơn vị</td><td>${unit.id}</td></tr>
      <tr><td>Mong muốn</td><td>${type}</td></tr>
      <tr><td>Giờ vào</td><td>${fromTime}</td></tr>
      <tr><td>Giờ ra</td><td>${toTime}</td></tr>
      <tr><td>Ngày cần điều chỉnh</td><td>${onDate}</td></tr>
      <tr style='vertical-align: top;'><td style='white-space:nowrap'>Lý do</td><td>${reason}</td></tr>
      <tr><td>Người duyệt</td><td>${reviewer}</td></tr>
    </table>`;

    const bodyCongTac = `<table>
      <tr><td>Email</td><td style="color: #d71920;">${email}</td></tr>
      <tr><td>Tên</td><td>${name}</td></tr>
      <tr><td>Chức danh</td><td>${title}</td></tr>
      <tr><td>Đơn vị</td><td>${unit.id}</td></tr>
      <tr><td>Mong muốn</td><td>${type}</td></tr>
      <tr><td>Thời gian bắt đầu</td><td>${fromTime}</td></tr>
      <tr><td>Ngày bắt đầu công tác</td><td>${fromDate}</td></tr>
      <tr><td>Thời gian kết thúc</td><td>${toTime}</td></tr>
      <tr><td>Ngày kết thúc công tác</td><td>${toDate}</td></tr>
      <tr style='vertical-align: top;'><td style='white-space:nowrap'>Nơi công tác</td><td>${reason}</td></tr>
      <tr><td>Người duyệt</td><td>${reviewer}</td></tr>
    </table>`;

    const body = type == 'Nghỉ phép' ? bodyNghiPhep : type == 'Điều chỉnh chấm công' ? bodyChamCong : bodyCongTac;

    const html = htmlTemplate.replace('{{type}}', type).replace('{{table}}', body);

    if (!pending.exists || pending == undefined) {
      functions.logger.info('No such document!');
    } else {
      const data = pending.data();
      if (data == undefined) return;
      if (isApproved != undefined && !isApproved && pending.data() != undefined) {
        // if (data != undefined) {
        // Reject at with date format yyy-mm-dd
        data.rejectedAt = new Date();
        data.rejectBy = reviewer;
        await admin.firestore().collection('rejects').doc(id).set(data);
        // }
        await pendingRef.delete();
        subject = `Đã từ chối ${subject}`;
        const rejectHtml = html.replace('</table>', `<tr style='vertical-align: top;'>
          <td style='white-space:nowrap'>Lý do từ chối</td><td>${rejectReason}</td></tr>
        </tr></table>`);
        sendEmail(email, subject, rejectHtml);
        sendEmail(reviewer, subject, rejectHtml, form.unit.xemTT);
        response.status(200).send({ data: 'Đã từ chối' });
        functions.logger.info(reviewer, 'reject');
        return;
      }

      if (title == 'Nhân viên/KTV' && days > 2) {
        if (form.approvedByQLPB == true && reviewer == form.unit.emailPGD) {
          data.approvedAt = new Date();
          data.approvedBy = reviewer;
          data.approvedByPGD = true;
          await admin.firestore().collection('approves').doc(id).set(data);
          await pendingRef.delete();
          subject = `PGD đã duyệt ${subject}`;
          sendEmail(email, subject, html);
          sendEmail(reviewer, subject, html, form.unit.xemTT);
          response.status(200).send({ data: 'PGD đã duyệt' });
          functions.logger.info(reviewer, 'approve1');
          return;
        } else if (form.approvedByQLPB == false) {
          if (form.unit.emailQLPB == reviewer) {
            await pendingRef.update({
              approvedByQLPB: true,
            });
            sendEmail(reviewer, subject, html);
            const confirmBody = body.replace('</table>', `<tr>
              <td>Link xác nhận</td>
              <td><a style="color: #e91218; text-decodation:underline" href="https://xin-nghi-phep-7ff68.web.app/duyet-nghi-phep/${id}?reviewer=${form.unit.emailPGD}">Xác nhận</a></td>
            </tr></table>`);
            const confirmHtml = htmlTemplate.replace('{{type}}', type).replace('{{table}}', confirmBody);
            sendEmail(form.unit.emailPGD, subject, confirmHtml);
            response.status(200).send({ data: 'QLPB đã duyệt' });
            functions.logger.info(reviewer, 'approve3');
          }
          // if (form.unit.emailPGD == reviewer) {
          //   await pendingRef.update({
          //     approvedByPGD: true,
          //   });
          // }
          return;
        }
      } else {
        data.approvedAt = new Date();
        data.approvedBy = reviewer;
        if (reviewer == form.unit.emailQLPB) data.approvedByQLPB = true;
        if (reviewer == form.unit.emailPGD) {
          data.approvedByQLPB = true;
          data.approvedByPGD = true;
        }
        await admin.firestore().collection('approves').doc(id).set(data);
        await pendingRef.delete();
        subject = `Đã duyệt ${subject}`;
        sendEmail(email, subject, html);
        sendEmail(reviewer, subject, html, form.unit.xemTT);
        response.status(200).send({ data: 'Đã duyệt' });
        functions.logger.info(reviewer, 'approve4');
        return;
      }
    }
  } else {
    if (request.method == 'OPTIONS') {
      response.status(200).send('OK');
      return;
    }
    response.status(405).send('Method Not Allowed');
    return;
  }
  response.send('Empty Data');
});

const htmlTemplate = `
    <table bgcolor='#2c3d5b' style='
          line-height: inherit;
          vertical-align: top;
          border-collapse: collapse;
          font-family: 'Montserrat', sans-serif;
          font-style: normal;
          font-weight: 400;
          font-size: 14px;
          line-height: 150%;
          background-color: #2c3d5b;
          table-layout: fixed;
          word-break: break-word;
          width: 100%;
          height: 100%;
          margin: 0;
          padding: 0;
        ' valign='top' role='presentation' border='0' cellpadding='0' cellspacing='0' width='100%'>
        <tbody><tr>
          <td align='center'>
            <style>
              @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;700;800&display=swap');
            </style>
            <center width='100%'>
              <table role='presentation' border='0' cellpadding='0' cellspacing='0' width='100%' style='width: 100%; max-width: 600px; margin: 0 auto; padding: 16px'>
                <tbody><tr>
                  <td>
                    <table role='presentation' border='0' cellpadding='0' cellspacing='0' width='100%'>
                      <tbody><tr>
                        <td style='height: 48px'></td>
                      </tr>
                    </tbody></table>
                    <!-- Banner -->
                    <table role='presentation' border='0' cellpadding='0' cellspacing='0' width='100%'>
                      <tbody><tr>
                        <td bgcolor='#FFFFFF' align='right' style='border-radius: 8px; padding: 16px'>
                          <table role='presentation' width='100%'>
                            <tbody><tr>
                              <td>
                                <img alt='Logo' src='https://xin-nghi-phep-7ff68.web.app/assets/logo.png' width='100px' align='left'>
                              </td>
                              <td style='font-weight: bold; vertical-align: middle; text-align: right'>
                                Đơn xin {{type}}
                              </td>
                            </tr>
                          </tbody></table>
                        </td>
                      </tr>
                    </tbody></table>
                    <table role='presentation' border='0' cellpadding='0' cellspacing='0' width='100%'>
                      <tbody><tr>
                        <td style='height: 24px'></td>
                      </tr>
                    </tbody></table>
                    <table role='presentation' border='0' cellpadding='0' cellspacing='0' style='width: 100%; max-width: 600px; margin: 0 auto'>
                      <tbody>
                      <tr>
                        <td bgcolor='#FFFFFF' align='left' style='border-radius: 8px; padding: 24px'>
                          {{table}}
                        </td>
                      </tr>
                      <table role='presentation' border='0' cellpadding='0' cellspacing='0' width='100%'>
                        <tbody><tr>
                          <td style='height: 24px'></td>
                        </tr>
                      </tbody></table>
                      <tr>
                        <td bgcolor='#FFFFFF' align='center' style='border-radius: 8px; padding: 24px; color: red'>
                          <strong>Mọi thắc mắc xin vui lòng liên hệ Trưởng Đơn vị của bạn!</strong>
                        </td>
                      </tr>
                      <tr>
                        <td style='height: 24px'></td>
                      </tr>
                      <tr>
                        <td style='text-align: center; color: #cbd5e1; font-size: 12px'>
                          <strong>CN TCT CƠ KHÍ GIAO THÔNG VẬN TẢI SÀI GÒN - TNHH MTV XÍ NGHIỆP CƠ KHÍ Ô TÔ AN LẠC</strong><br>
                          <Strong>Địa chỉ - Xưởng Dịch vụ:<Strong><br>
                          36 Kinh Dương Vương, P. An Lạc A, Q. Bình Tân, Tp. HCM
                        </td>
                      </tr>
                      <tr>
                        <td style='height: 8px'></td>
                      </tr>
                      <tr>
                        <td style='text-align: center'>
                          <a style='color: #d71920; font-weight: 500' href='https://samcobus.vn/'>samcobus.vn</a>
                        </td>
                      </tr>
                      <tr>
                        <td style='height: 48px'></td>
                      </tr>
                    </tbody></table>
                  </td>
                </tr>
              </tbody></table>
            </center>
          </td>
        </tr>
      </tbody>
    </table>
    `;

/** Send email to user
 * @param {string} email
 * @param {string} subject
 * @param {string} html
 * @param {string[]} cc
 */
function sendEmail(email: string, subject: string, html: string, cc = []) {
  admin
    .firestore()
    .collection('mails')
    .add({
      to: email,
      message: {
        subject: subject,
        text: subject,
        html: html,
      },
      cc: ['binhhm2009@gmail.com', ...cc],
    })
    .then(() => functions.logger.info('Queued email for delivery!'));
}

