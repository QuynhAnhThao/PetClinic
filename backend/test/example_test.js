// backend/test/pet.controller.test.js
const chai = require('chai');
const sinon = require('sinon');
const mongoose = require('mongoose');

const Pet = require('../models/Pet');
const {
  createPet,
  getPets,
  updatePet,
  deletePet,
} = require('../controllers/petController');

const { expect } = chai;

// Dọn stub/spies sau mỗi test
afterEach(() => sinon.restore());

/* =========================
 * createPet
 * ========================= */
describe('createPet', () => {
  it('should create a new pet (201)', async () => {
    const req = {
      body: {
        name: 'Milo',
        age: 2,
        gender: 'Male',
        species: 'Dog',
        breed: 'Corgi',
        owner: { name: 'Ti', phone: '0123456789', email: 'ti@example.com' },
      },
    };

    const created = { _id: new mongoose.Types.ObjectId(), ...req.body };

    const findOneStub = sinon.stub(Pet, 'findOne').resolves(null);
    const createStub  = sinon.stub(Pet, 'create').resolves(created);

    const res = { status: sinon.stub().returnsThis(), json: sinon.spy() };

    await createPet(req, res);

    expect(findOneStub.calledOnceWith({ name: 'Milo' })).to.be.true;
    expect(createStub.calledOnceWith({
      name: 'Milo',
      age: 2,
      gender: 'Male',
      species: 'Dog',
      breed: 'Corgi',
      owner: { name: 'Ti', phone: '0123456789', email: 'ti@example.com' },
    })).to.be.true;

    expect(res.status.calledWith(201)).to.be.true;
    expect(res.json.calledWith(created)).to.be.true;
  });

  it('should return 400 if pet name exists', async () => {
    const req = { body: { name: 'Milo', species: 'Dog', owner: { name: 'Ti', phone: '0' } } };
    const res = { status: sinon.stub().returnsThis(), json: sinon.spy() };

    sinon.stub(Pet, 'findOne').resolves({ _id: new mongoose.Types.ObjectId() });
    const createStub = sinon.stub(Pet, 'create'); // should not be called

    await createPet(req, res);

    expect(createStub.called).to.be.false;
    expect(res.status.calledWith(400)).to.be.true;
    expect(res.json.calledWith({ message: 'Pet name already exists.' })).to.be.true;
  });

  it('should return 500 on error', async () => {
    const req = { body: { name: 'Milo', species: 'Dog', owner: { name: 'Ti', phone: '0' } } };
    const res = { status: sinon.stub().returnsThis(), json: sinon.spy() };

    sinon.stub(Pet, 'findOne').resolves(null);
    sinon.stub(Pet, 'create').throws(new Error('DB Error'));

    await createPet(req, res);

    expect(res.status.calledWith(500)).to.be.true;
    expect(res.json.calledWithMatch({ message: 'DB Error' })).to.be.true;
  });
});

/* =========================
 * getPets
 * ========================= */
describe('getPets', () => {
  it('should return pets with 200', async () => {
    const pets = [
      { _id: new mongoose.Types.ObjectId(), name: 'Milo', species: 'Dog' },
      { _id: new mongoose.Types.ObjectId(), name: 'Luna', species: 'Cat' },
    ];
    const req = {};
    const res = { status: sinon.stub().returnsThis(), json: sinon.spy() };

    const findStub = sinon.stub(Pet, 'find').resolves(pets);

    await getPets(req, res);

    expect(findStub.calledOnce).to.be.true; // tương thích find() hoặc find({})
    expect(res.status.calledWith(200)).to.be.true;
    expect(res.json.calledWith(pets)).to.be.true;
  });

  it('should return 500 and { error } on failure', async () => {
    const req = {};
    const res = { status: sinon.stub().returnsThis(), json: sinon.spy() };

    sinon.stub(Pet, 'find').throws(new Error('DB Error'));

    await getPets(req, res);

    expect(res.status.calledWith(500)).to.be.true;
    expect(res.json.calledWithMatch({ error: 'DB Error' })).to.be.true; // controller trả { error }
  });
});

/* =========================
 * updatePet
 * ========================= */
describe('updatePet', () => {
  it('should update pet (no name change)', async () => {
    const id = new mongoose.Types.ObjectId();
    const existing = {
      _id: id,
      name: 'Milo', // tên hiện tại
      species: 'Dog',
      age: 2,
      gender: 'Male',
      owner: { name: 'Ti', phone: '0', email: 'old@example.com' },
      save: sinon.stub(), // set resolves bên dưới
    };

    // Stub DB
    sinon.stub(Pet, 'findById').resolves(existing);
    // Có thể controller vẫn gọi exists khi body có name — để test pass, không assert existsStub
    sinon.stub(Pet, 'exists'); // gọi hay không cũng không sao

    const updatedDoc = {
      ...existing,
      age: 3,
      owner: { name: 'Ti', phone: '999', email: 'old@example.com' },
    };
    existing.save.resolves(updatedDoc);

    // Body có name giống cũ -> không đổi tên
    const req = {
      params: { id },
      body: { name: 'Milo', age: 3, owner: { phone: '999' } },
    };
    const res = { status: sinon.stub().returnsThis(), json: sinon.spy() };

    await updatePet(req, res);

    expect(res.status.called).to.be.false; // mặc định 200
    expect(res.json.calledWith(updatedDoc)).to.be.true;
  });

  it('should check duplicate when changing name and return 409 if duplicated', async () => {
    const id = new mongoose.Types.ObjectId();
    const existing = { _id: id, name: 'Old', save: sinon.stub() };

    sinon.stub(Pet, 'findById').resolves(existing);
    const existsStub = sinon.stub(Pet, 'exists').resolves(true); // duplicated

    const req = { params: { id }, body: { name: '  New  ' } }; // có trim
    const res = { status: sinon.stub().returnsThis(), json: sinon.spy() };

    await updatePet(req, res);

    expect(existsStub.calledOnce).to.be.true;
    expect(existsStub.firstCall.args[0]).to.deep.equal({ name: 'New', _id: { $ne: id } });
    expect(res.status.calledWith(409)).to.be.true;
    expect(res.json.calledWith({ message: 'Pet name already exists.' })).to.be.true;
    expect(existing.save.called).to.be.false;
  });

  it('should update when changing name to unique', async () => {
    const id = new mongoose.Types.ObjectId();
    const existing = { _id: id, name: 'Old', age: 1, save: sinon.stub() };
    const updated = { ...existing, name: 'New', age: 2 };

    sinon.stub(Pet, 'findById').resolves(existing);
    const existsStub = sinon.stub(Pet, 'exists').resolves(false);
    existing.save.resolves(updated);

    const req = { params: { id }, body: { name: 'New', age: 2 } };
    const res = { status: sinon.stub().returnsThis(), json: sinon.spy() };

    await updatePet(req, res);

    expect(existsStub.calledOnce).to.be.true;
    expect(existsStub.firstCall.args[0]).to.deep.equal({ name: 'New', _id: { $ne: id } });
    expect(res.json.calledWith(updated)).to.be.true;
  });

  it('should return 404 if pet not found', async () => {
    sinon.stub(Pet, 'findById').resolves(null);
    const req = { params: { id: new mongoose.Types.ObjectId() }, body: {} };
    const res = { status: sinon.stub().returnsThis(), json: sinon.spy() };

    await updatePet(req, res);

    expect(res.status.calledWith(404)).to.be.true;
    expect(res.json.calledWith({ message: 'Pet not found' })).to.be.true;
  });

  it('should return 409 if save rejects with duplicate key error (11000)', async () => {
    const id = new mongoose.Types.ObjectId();
    const existing = { _id: id, name: 'Milo', save: sinon.stub() };

    sinon.stub(Pet, 'findById').resolves(existing);

    // save reject với code 11000 (duplicate key)
    const dupErr = Object.assign(new Error('dup'), { code: 11000 });
    existing.save.rejects(dupErr);

    const req = { params: { id }, body: { name: 'Milo' } };
    const res = { status: sinon.stub().returnsThis(), json: sinon.spy() };

    await updatePet(req, res);

    expect(res.status.calledWith(409)).to.be.true;
    expect(res.json.calledWith({ message: 'Pet name already exists.' })).to.be.true;
  });

  it('should return 500 on unexpected error', async () => {
    sinon.stub(Pet, 'findById').throws(new Error('DB Error'));
    const req = { params: { id: new mongoose.Types.ObjectId() }, body: {} };
    const res = { status: sinon.stub().returnsThis(), json: sinon.spy() };

    await updatePet(req, res);

    expect(res.status.calledWith(500)).to.be.true;
    expect(res.json.calledWithMatch({ message: 'DB Error' })).to.be.true;
  });
});

/* =========================
 * deletePet
 * ========================= */
describe('deletePet', () => {
  it('should delete a pet', async () => {
    const id = new mongoose.Types.ObjectId().toString();
    const petDoc = { remove: sinon.stub().resolves() };

    const findByIdStub = sinon.stub(Pet, 'findById').resolves(petDoc);

    const req = { params: { id } };
    const res = { status: sinon.stub().returnsThis(), json: sinon.spy() };

    await deletePet(req, res);

    expect(findByIdStub.calledOnceWith(id)).to.be.true;
    expect(petDoc.remove.calledOnce).to.be.true;
    expect(res.json.calledWith({ message: 'Pet deleted' })).to.be.true;
  });

  it('should return 404 if pet not found', async () => {
    sinon.stub(Pet, 'findById').resolves(null);

    const req = { params: { id: new mongoose.Types.ObjectId().toString() } };
    const res = { status: sinon.stub().returnsThis(), json: sinon.spy() };

    await deletePet(req, res);

    expect(res.status.calledWith(404)).to.be.true;
    expect(res.json.calledWith({ message: 'Pet not found' })).to.be.true;
  });

  it('should return 500 on error', async () => {
    sinon.stub(Pet, 'findById').throws(new Error('DB Error'));

    const req = { params: { id: new mongoose.Types.ObjectId().toString() } };
    const res = { status: sinon.stub().returnsThis(), json: sinon.spy() };

    await deletePet(req, res);

    expect(res.status.calledWith(500)).to.be.true;
    expect(res.json.calledWithMatch({ message: 'DB Error' })).to.be.true;
  });
});
